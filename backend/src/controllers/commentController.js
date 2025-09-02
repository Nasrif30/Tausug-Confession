// server/src/controllers/commentController.js
const { supabase } = require('../config/supabase');
const { validationResult } = require('express-validator');

// Create a comment
const createComment = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const { content, parentId } = req.body;
    const { id: userId } = req.user;

    // Check if confession exists
    const { data: confession, error: confessionError } = await supabase
      .from('confessions')
      .select('id, status')
      .eq('id', confessionId)
      .single();

    if (confessionError || !confession) {
      return res.status(404).json({
        success: false,
        error: 'Confession not found'
      });
    }

    if (confession.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: 'Cannot comment on unpublished confession'
      });
    }

    // If this is a reply, check if parent comment exists
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parentId)
        .eq('confession_id', confessionId)
        .single();

      if (parentError || !parentComment) {
        return res.status(400).json({
          success: false,
          error: 'Parent comment not found'
        });
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          confession_id: confessionId,
          user_id: userId,
          content,
          parent_id: parentId || null
        }
      ])
      .select(`
        id,
        content,
        parent_id,
        created_at,
        updated_at,
        user:profiles!comments_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action: 'comment_created',
        target_type: 'confession',
        target_id: confessionId,
        metadata: { comment_id: comment.id }
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create comment'
    });
  }
};

// Get comments for a confession
const getComments = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;
    
    const offset = (page - 1) * limit;
    
    let orderBy = 'created_at';
    let ascending = false;
    
    if (sort === 'oldest') {
      ascending = true;
    } else if (sort === 'popular') {
      orderBy = 'likes';
      ascending = false;
    }

    const { data: comments, error, count } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        parent_id,
        created_at,
        updated_at,
        likes:comment_likes(count),
        user:profiles!comments_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          role
        ),
        replies:comments!comments_parent_id_fkey(
          id,
          content,
          created_at,
          updated_at,
          likes:comment_likes(count),
          user:profiles!comments_user_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            role
          )
        )
      `, { count: 'exact' })
      .eq('confession_id', confessionId)
      .is('parent_id', null) // Only top-level comments
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get comments'
    });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const { id: userId } = req.user;

    // Check if comment exists and belongs to user
    const { data: comment, error: checkError } = await supabase
      .from('comments')
      .select('id, user_id, content')
      .eq('id', commentId)
      .single();

    if (checkError || !comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to edit this comment'
      });
    }

    // Update comment
    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select(`
        id,
        content,
        parent_id,
        created_at,
        updated_at,
        user:profiles!comments_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update comment'
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { id: userId, role } = req.user;

    // Check if comment exists
    const { data: comment, error: checkError } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (checkError || !comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if user can delete (owner or admin/moderator)
    if (comment.user_id !== userId && !['admin', 'moderator'].includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }

    // Delete comment (this will cascade to replies and likes)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw error;
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action: 'comment_deleted',
        target_type: 'comment',
        target_id: commentId
      }
    ]);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment'
    });
  }
};

// Like/unlike a comment
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { id: userId } = req.user;

    // Check if comment exists
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if already liked
    const { data: existingLike, error: likeError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        throw deleteError;
      }

      res.json({
        success: true,
        message: 'Comment unliked',
        liked: false
      });
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert([
          {
            comment_id: commentId,
            user_id: userId
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      res.json({
        success: true,
        message: 'Comment liked',
        liked: true
      });
    }
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle comment like'
    });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike
};
