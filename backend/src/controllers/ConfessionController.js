// server/src/controllers/confessionController.js
const { validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');

// -------------------- CREATE --------------------
const createConfession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, category, tags, coverImageUrl } = req.body;

    const { data: confession, error } = await supabase
      .from('confessions')
      .insert([{
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'general',
        tags: tags || [],
        cover_image_url: coverImageUrl || null,
        author_id: req.user.id,
        status: 'draft'
      }])
      .select(`
        *,
        profiles:author_id (
          username,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (error) {
      console.error('Create confession error:', error);
      return res.status(400).json({ error: 'Creation failed' });
    }

    await supabase.from('activity_logs').insert([{
      user_id: req.user.id,
      action: 'confession_created',
      target_type: 'confession',
      target_id: confession.id,
      metadata: { title, category }
    }]);

    res.status(201).json({
      message: 'Confession created successfully',
      confession
    });

  } catch (error) {
    console.error('Create confession error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- READ --------------------
const getConfessions = async (req, res) => {
  try {
    // Check if database tables exist by testing a simple query
    try {
      const { data: testData, error: testError } = await supabase
        .from('confessions')
        .select('id')
        .limit(1);
      
      if (testError && testError.code === '42P01') {
        // Table doesn't exist yet
        return res.json({
          confessions: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          },
          message: 'Database setup in progress. Please wait for tables to be created.'
        });
      }
    } catch (testErr) {
      // Database connection issue
      return res.status(503).json({ 
        error: 'Database not ready',
        message: 'Please ensure database tables are created first.'
      });
    }

    const { page = 1, limit = 10, category, search, sortBy = 'created_at', userId } = req.query;
    const offset = (page - 1) * limit;
    const maxLimit = Math.min(parseInt(limit), 50);

    let query = supabase
      .from('confessions')
      .select(`
        *,
        profiles:author_id (
          username,
          full_name,
          avatar_url,
          role
        )
      `, { count: 'exact' });

    if (!userId || userId !== req.user?.id) {
      query = query.eq('status', 'published');
    } else {
      query = query.eq('author_id', userId);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const validSortFields = ['created_at', 'total_likes', 'total_views', 'total_comments', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = sortBy === 'title';
    query = query.order(sortField, { ascending: sortOrder });

    query = query.range(offset, offset + maxLimit - 1);

    const { data: confessions, error, count } = await query;
    if (error) {
      console.error('Get confessions error:', error);
      return res.status(400).json({ error: 'Fetch failed' });
    }

    let userLikes = [];
    if (req.user && confessions.length > 0) {
      const confessionIds = confessions.map(c => c.id);
      const { data: likes } = await supabase
        .from('likes')
        .select('confession_id')
        .eq('user_id', req.user.id)
        .in('confession_id', confessionIds);
      userLikes = likes?.map(l => l.confession_id) || [];
    }

    const confessionsWithLikes = confessions.map(c => ({
      ...c,
      isLiked: userLikes.includes(c.id)
    }));

    res.json({
      confessions: confessionsWithLikes,
      pagination: {
        page: parseInt(page),
        limit: maxLimit,
        total: count,
        totalPages: Math.ceil(count / maxLimit)
      }
    });

  } catch (error) {
    console.error('Get confessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getConfessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: confession, error } = await supabase
      .from('confessions')
      .select(`
        *,
        profiles:author_id (
          username,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error || !confession) {
      return res.status(404).json({ error: 'Confession not found' });
    }

    const canView = confession.status === 'published' ||
      (req.user && req.user.id === confession.author_id) ||
      (req.user && ['moderator', 'admin'].includes(req.user.role));

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: chapters } = await supabase
      .from('chapters')
      .select('*')
      .eq('confession_id', id)
      .order('chapter_number');

    let isLiked = false;
    if (req.user) {
      const { data: userLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('confession_id', id)
        .maybeSingle();
      isLiked = !!userLike;
    }

    if (confession.status === 'published' && (!req.user || req.user.id !== confession.author_id)) {
      await supabase
        .from('confessions')
        .update({ total_views: confession.total_views + 1 })
        .eq('id', id);
      confession.total_views += 1;
    }

    res.json({
      confession: {
        ...confession,
        chapters: chapters || [],
        isLiked
      }
    });

  } catch (error) {
    console.error('Get confession error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- UPDATE --------------------
const updateConfession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: confession, error } = await supabase
      .from('confessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update confession error:', error);
      return res.status(400).json({ error: 'Update failed' });
    }

    res.json({
      message: 'Confession updated successfully',
      confession
    });

  } catch (error) {
    console.error('Update confession error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- CHAPTERS --------------------
const createChapter = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const { title, content } = req.body;

    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert([{
        confession_id: confessionId,
        title,
        content,
        chapter_number: 1
      }])
      .select()
      .single();

    if (error) {
      console.error('Create chapter error:', error);
      return res.status(400).json({ error: 'Creation failed' });
    }

    res.status(201).json({
      message: 'Chapter created successfully',
      chapter
    });

  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const updates = req.body;

    const { data: chapter, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', chapterId)
      .select()
      .single();

    if (error) {
      console.error('Update chapter error:', error);
      return res.status(400).json({ error: 'Update failed' });
    }

    res.json({
      message: 'Chapter updated successfully',
      chapter
    });

  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- LIKE --------------------
const likeConfession = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('confession_id', id)
      .maybeSingle();

    if (existingLike) {
      await supabase.from('likes')
        .delete()
        .eq('id', existingLike.id);

      await supabase.rpc('decrement_likes', { confession_id: id });

      return res.json({ message: 'Like removed' });
    } else {
      await supabase.from('likes')
        .insert([{
          user_id: req.user.id,
          confession_id: id
        }]);

      await supabase.rpc('increment_likes', { confession_id: id });

      return res.json({ message: 'Like added' });
    }

  } catch (error) {
    console.error('Like confession error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- DELETE --------------------
const deleteConfession = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('confessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete confession error:', error);
      return res.status(400).json({ error: 'Delete failed' });
    }

    res.json({ message: 'Confession deleted successfully' });

  } catch (error) {
    console.error('Delete confession error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// -------------------- EXPORT --------------------
module.exports = {
  createConfession,
  getConfessions,
  getConfessionById,
  updateConfession,
  createChapter,
  updateChapter,
  likeConfession,
  deleteConfession
};
