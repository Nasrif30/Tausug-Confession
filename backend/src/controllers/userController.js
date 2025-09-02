// server/src/controllers/userController.js
const { supabase } = require('../config/supabase');
const { validationResult } = require('express-validator');

// Get user profile by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        role,
        created_at,
        updated_at,
        confessions:confessions(count),
        followers:followers(count),
        following:following(count)
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

// Get user profile by username
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        role,
        created_at,
        updated_at,
        confessions:confessions(count),
        followers:followers(count),
        following:following(count)
      `)
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

// Get user's confessions
const getUserConfessions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'published' } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { data: confessions, error, count } = await supabase
      .from('confessions')
      .select(`
        id,
        title,
        description,
        category,
        tags,
        cover_image_url,
        status,
        created_at,
        updated_at,
        chapters:chapters(count),
        likes:likes(count)
      `, { count: 'exact' })
      .eq('user_id', id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: confessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user confessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user confessions'
    });
  }
};

// Follow user
const followUser = async (req, res) => {
  try {
    const { id: followerId } = req.user;
    const { id: followingId } = req.params;

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself'
      });
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'Already following this user'
      });
    }

    // Create follow relationship
    const { data: follow, error } = await supabase
      .from('follows')
      .insert([
        {
          follower_id: followerId,
          following_id: followingId
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: followerId,
        action: 'user_followed',
        target_type: 'user',
        target_id: followingId
      }
    ]);

    res.json({
      success: true,
      message: 'User followed successfully',
      data: follow
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow user'
    });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  try {
    const { id: followerId } = req.user;
    const { id: followingId } = req.params;

    const { data: follow, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!follow) {
      return res.status(404).json({
        success: false,
        error: 'Follow relationship not found'
      });
    }

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unfollow user'
    });
  }
};

// Get user's followers
const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { data: followers, error, count } = await supabase
      .from('follows')
      .select(`
        follower:profiles!follows_follower_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          role
        )
      `, { count: 'exact' })
      .eq('following_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const formattedFollowers = followers.map(f => f.follower);

    res.json({
      success: true,
      data: formattedFollowers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user followers'
    });
  }
};

// Get user's following
const getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { data: following, error, count } = await supabase
      .from('follows')
      .select(`
        following:profiles!follows_following_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          role
        )
      `, { count: 'exact' })
      .eq('follower_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const formattedFollowing = following.map(f => f.following);

    res.json({
      success: true,
      data: formattedFollowing,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user following error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user following'
    });
  }
};

// Get current user's profile with stats
const getUserProfile = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        role,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Get user stats
    const [
      { count: totalConfessions },
      { count: totalLikes },
      { count: totalViews },
      { count: totalComments }
    ] = await Promise.all([
      supabase.from('confessions').select('*', { count: 'exact', head: true }).eq('author_id', userId),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('confession_id', supabase.from('confessions').select('id').eq('author_id', userId)),
      supabase.from('confessions').select('total_views', { count: 'exact', head: true }).eq('author_id', userId),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('confession_id', supabase.from('confessions').select('id').eq('author_id', userId))
    ]);

    // Get recent stories
    const { data: recentStories } = await supabase
      .from('confessions')
      .select(`
        id,
        title,
        status,
        total_views,
        total_likes,
        created_at
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalConfessions: totalConfessions || 0,
          totalLikes: totalLikes || 0,
          totalViews: totalViews || 0,
          totalComments: totalComments || 0
        },
        recentStories: recentStories || []
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

// Get user's bookmarks
const getUserBookmarks = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { data: bookmarks, error, count } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        confession:confessions!bookmarks_confession_id_fkey(
          id,
          title,
          description,
          total_views,
          total_likes,
          author:profiles!confessions_author_id_fkey(
            id,
            username,
            full_name
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: bookmarks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user bookmarks'
    });
  }
};

module.exports = {
  getUserById,
  getUserByUsername,
  getUserConfessions,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserProfile,
  getUserBookmarks
};
