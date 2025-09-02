// server/src/controllers/moderatorController.js
const { supabase } = require('../config/supabase');

// Get content for moderation
const getContentForModeration = async (req, res) => {
  try {
    const { id: moderatorId } = req.user;
    const { page = 1, limit = 20, type, status } = req.query;

    // Verify moderator role
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', moderatorId)
      .single();

    if (userError || !user || !['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Moderator access required'
      });
    }

    const offset = (page - 1) * limit;
    let query;

    if (type === 'comments') {
      query = supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          is_approved,
          moderated_by,
          moderated_at,
          author:profiles!comments_author_id_fkey(
            id,
            username,
            full_name,
            role
          ),
          confession:confessions!comments_confession_id_fkey(
            id,
            title
          )
        `, { count: 'exact' });
    } else {
      query = supabase
        .from('confessions')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          author:profiles!confessions_author_id_fkey(
            id,
            username,
            full_name,
            role
          )
        `, { count: 'exact' });
    }

    // Apply filters
    if (status) {
      if (type === 'comments') {
        query = query.eq('is_approved', status === 'approved');
      } else {
        query = query.eq('status', status);
      }
    }

    const { data: content, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get content for moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content for moderation'
    });
  }
};

// Approve/reject comment
const moderateComment = async (req, res) => {
  try {
    const { id: moderatorId } = req.user;
    const { commentId } = req.params;
    const { action, reason } = req.body;

    // Verify moderator role
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', moderatorId)
      .single();

    if (userError || !user || !['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Moderator access required'
      });
    }

    const isApproved = action === 'approve';

    // Update comment
    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({
        is_approved: isApproved,
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log moderation action
    await supabase.from('moderation_logs').insert([
      {
        moderator_id: moderatorId,
        action: isApproved ? 'comment_approved' : 'comment_rejected',
        target_type: 'comment',
        target_id: commentId,
        reason: reason || null,
        metadata: { action, comment_content: updatedComment.content }
      }
    ]);

    res.json({
      success: true,
      message: `Comment ${action}d successfully`,
      data: updatedComment
    });
  } catch (error) {
    console.error('Moderate comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to moderate comment'
    });
  }
};

// Moderate confession
const moderateConfession = async (req, res) => {
  try {
    const { id: moderatorId } = req.user;
    const { confessionId } = req.params;
    const { action, reason } = req.body;

    // Verify moderator role
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', moderatorId)
      .single();

    if (userError || !user || !['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Moderator access required'
      });
    }

    let newStatus;
    switch (action) {
      case 'approve':
        newStatus = 'published';
        break;
      case 'reject':
        newStatus = 'removed';
        break;
      case 'archive':
        newStatus = 'archived';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

    // Update confession
    const { data: updatedConfession, error } = await supabase
      .from('confessions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', confessionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log moderation action
    await supabase.from('moderation_logs').insert([
      {
        moderator_id: moderatorId,
        action: `confession_${action}d`,
        target_type: 'confession',
        target_id: confessionId,
        reason: reason || null,
        metadata: { action, new_status: newStatus, title: updatedConfession.title }
      }
    ]);

    res.json({
      success: true,
      message: `Confession ${action}d successfully`,
      data: updatedConfession
    });
  } catch (error) {
    console.error('Moderate confession error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to moderate confession'
    });
  }
};

// Get moderation statistics
const getModerationStats = async (req, res) => {
  try {
    const { id: moderatorId } = req.user;

    // Verify moderator role
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', moderatorId)
      .single();

    if (userError || !user || !['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Moderator access required'
      });
    }

    // Get counts
    const [
      { count: pendingComments },
      { count: pendingConfessions },
      { count: totalModerated },
      { count: todayModerated }
    ] = await Promise.all([
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('confessions').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('moderation_logs').select('*', { count: 'exact', head: true }).eq('moderator_id', moderatorId),
      supabase.from('moderation_logs').select('*', { count: 'exact', head: true }).eq('moderator_id', moderatorId).gte('created_at', new Date().toISOString().split('T')[0])
    ]);

    // Get recent moderation activity
    const { data: recentActivity } = await supabase
      .from('moderation_logs')
      .select(`
        id,
        action,
        target_type,
        created_at,
        target:confessions!moderation_logs_target_id_fkey(
          title
        )
      `)
      .eq('moderator_id', moderatorId)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          pendingComments: pendingComments || 0,
          pendingConfessions: pendingConfessions || 0,
          totalModerated: totalModerated || 0,
          todayModerated: todayModerated || 0
        },
        recentActivity: recentActivity || []
      }
    });
  } catch (error) {
    console.error('Get moderation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get moderation statistics'
    });
  }
};

module.exports = {
  getContentForModeration,
  moderateComment,
  moderateConfession,
  getModerationStats
};
