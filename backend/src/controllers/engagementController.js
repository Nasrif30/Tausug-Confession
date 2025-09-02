// server/src/controllers/engagementController.js
const { supabase } = require('../config/supabase');

// Toggle like on confession
const toggleLike = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { confessionId } = req.params;

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('confession_id', confessionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let liked = false;
    let message = '';

    if (existingLike) {
      // Remove like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;

      // Update confession like count
      await supabase.rpc('decrement_like_count', { confession_id: confessionId });
      
      message = 'Like removed';
    } else {
      // Add like
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{
          user_id: userId,
          confession_id: confessionId
        }]);

      if (insertError) throw insertError;

      // Update confession like count
      await supabase.rpc('increment_like_count', { confession_id: confessionId });
      
      liked = true;
      message = 'Story liked';

      // Check for badge eligibility
      await checkBadgeEligibility(userId, 'likes');
    }

    // Get updated like count
    const { data: confession } = await supabase
      .from('confessions')
      .select('total_likes')
      .eq('id', confessionId)
      .single();

    res.json({
      success: true,
      message,
      liked,
      totalLikes: confession?.total_likes || 0
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update like'
    });
  }
};

// Toggle bookmark on confession
const toggleBookmark = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { confessionId } = req.params;

    // Check if already bookmarked
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('confession_id', confessionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let bookmarked = false;
    let message = '';

    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);

      if (deleteError) throw deleteError;
      
      message = 'Bookmark removed';
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert([{
          user_id: userId,
          confession_id: confessionId
        }]);

      if (insertError) throw insertError;
      
      bookmarked = true;
      message = 'Story bookmarked';
    }

    res.json({
      success: true,
      message,
      bookmarked
    });

  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update bookmark'
    });
  }
};

// Get user bookmarks
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
          cover_image_url,
          total_chapters,
          total_views,
          total_likes,
          total_comments,
          category,
          tags,
          author:profiles!confessions_author_id_fkey(
            username,
            full_name,
            avatar_url
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

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
      error: 'Failed to get bookmarks'
    });
  }
};

// Get user badges
const getUserBadges = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const { data: badges, error } = await supabase
      .from('user_badges')
      .select(`
        awarded_at,
        badge:badges(
          id,
          name,
          description,
          icon_url,
          color
        )
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: badges
    });

  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get badges'
    });
  }
};

// Award badge to user (admin/moderator only)
const awardBadge = async (req, res) => {
  try {
    const { id: moderatorId } = req.user;
    const { userId, badgeId, reason } = req.body;

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

    // Check if user already has this badge
    const { data: existingBadge, error: checkError } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        error: 'User already has this badge'
      });
    }

    // Award badge
    const { data: awardedBadge, error } = await supabase
      .from('user_badges')
      .insert([{
        user_id: userId,
        badge_id: badgeId,
        awarded_by: moderatorId
      }])
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action: 'badge_awarded',
        target_type: 'badge',
        target_id: badgeId,
        metadata: { awarded_by: moderatorId, reason }
      }
    ]);

    res.json({
      success: true,
      message: 'Badge awarded successfully',
      data: awardedBadge
    });

  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award badge'
    });
  }
};

// Check badge eligibility and award automatically
const checkBadgeEligibility = async (userId, type) => {
  try {
    let badgeId = null;
    let shouldAward = false;

    switch (type) {
      case 'first_story':
        // Check if user has published their first story
        const { count: storyCount } = await supabase
          .from('confessions')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('status', 'published');

        if (storyCount === 1) {
          badgeId = 'First Story';
          shouldAward = true;
        }
        break;

      case 'popular_author':
        // Check if any story has 100+ views
        const { data: popularStory } = await supabase
          .from('confessions')
          .select('id')
          .eq('author_id', userId)
          .gte('total_views', 100)
          .single();

        if (popularStory) {
          badgeId = 'Popular Author';
          shouldAward = true;
        }
        break;

      case 'likes':
        // Check if user has given 50+ likes
        const { count: likeCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (likeCount === 50) {
          badgeId = 'Engaged Member';
          shouldAward = true;
        }
        break;
    }

    if (shouldAward && badgeId) {
      // Get badge ID from name
      const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', badgeId)
        .single();

      if (badge) {
        // Award badge
        await supabase
          .from('user_badges')
          .insert([{
            user_id: userId,
            badge_id: badge.id,
            awarded_by: null // System awarded
          }]);

        // Log activity
        await supabase.from('activity_logs').insert([
          {
            user_id: userId,
            action: 'badge_awarded',
            target_type: 'badge',
            target_id: badge.id,
            metadata: { awarded_by: 'system', reason: 'Automatic achievement' }
          }
        ]);
      }
    }
  } catch (error) {
    console.error('Check badge eligibility error:', error);
  }
};

module.exports = {
  toggleLike,
  toggleBookmark,
  getUserBookmarks,
  getUserBadges,
  awardBadge,
  checkBadgeEligibility
};
