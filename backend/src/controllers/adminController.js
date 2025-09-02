// server/src/controllers/adminController.js
const { supabase } = require('../config/supabase');

// Get comprehensive platform statistics
const getPlatformStats = async (req, res) => {
  try {
    const { id: adminId } = req.user;

    // Verify admin role
    const { data: admin, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Get comprehensive counts
    const [
      { count: totalUsers },
      { count: totalConfessions },
      { count: totalComments },
      { count: totalLikes },
      { count: totalBookmarks },
      { count: pendingReports },
      { count: bannedUsers }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('confessions').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*', { count: 'exact', head: true }),
      supabase.from('bookmarks').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true)
    ]);

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const userGrowth = recentUsers ? recentUsers.length : 0;

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        created_at,
        user:profiles!activity_logs_user_id_fkey(
          username,
          full_name,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent users
    const { data: recentUsersList } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        role,
        created_at,
        avatar_url
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent confessions
    const { data: recentConfessions } = await supabase
      .from('confessions')
      .select(`
        id,
        title,
        status,
        created_at,
        total_views,
        total_likes,
        author:profiles!confessions_author_id_fkey(
          username,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers || 0,
          totalConfessions: totalConfessions || 0,
          totalComments: totalComments || 0,
          totalLikes: totalLikes || 0,
          totalBookmarks: totalBookmarks || 0,
          pendingReports: pendingReports || 0,
          bannedUsers: bannedUsers || 0,
          userGrowth
        },
        recentActivity: recentActivity || [],
        recentUsers: recentUsersList || [],
        recentConfessions: recentConfessions || []
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get platform statistics'
    });
  }
};

// Get all users with comprehensive data
const getAllUsers = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { page = 1, limit = 20, role, search, status } = req.query;

    // Verify admin role
    const { data: admin, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,

        role,
        bio,
        avatar_url,
        created_at,
        updated_at,
        is_banned,
        confessions:confessions(count)
      `, { count: 'exact' });

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (status === 'banned') {
      query = query.eq('is_banned', true);
    } else if (status === 'active') {
      query = query.eq('is_banned', false);
    }

    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { userId } = req.params;
    const { role } = req.body;

    // Verify admin role
    const { data: admin, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Validate role
    const validRoles = ['user', 'member', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // Prevent admin from changing their own role
    if (adminId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: adminId,
      action: 'user_role_updated',
      target_type: 'user',
      target_id: userId,
      metadata: { new_role: role, previous_role: updatedUser.role }
    }]);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

// Ban/unban user
const toggleUserBan = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { userId } = req.params;
    const { banned, reason } = req.body;

    // Verify admin role
    const { data: admin, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Prevent admin from banning themselves
    if (adminId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot ban yourself'
      });
    }

    // Update user ban status
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ 
        is_banned: banned,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: adminId,
      action: banned ? 'user_banned' : 'user_unbanned',
      target_type: 'user',
      target_id: userId,
      metadata: { reason: banned ? reason : null }
    }]);

    res.json({
      success: true,
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user ban status'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { userId } = req.params;

    // Verify admin role
    const { data: admin, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Prevent admin from deleting themselves
    if (adminId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete yourself'
      });
    }

    // Delete user (this will cascade to related data)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: adminId,
      action: 'user_deleted',
      target_type: 'user',
      target_id: userId,
      metadata: { deleted_by: adminId }
    }]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// Get pending reports
const getPendingReports = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { page = 1, limit = 20 } = req.query;

    // Verify admin or moderator role
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (userError || !user || !['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Admin or moderator access required'
      });
    }

    const offset = (page - 1) * limit;

    const { data: reports, error, count } = await supabase
      .from('reports')
      .select(`
        id,
        reason,
        description,
        status,
        created_at,
        reporter:profiles!reports_reporter_id_fkey(
          id,
          username,
          full_name
        ),
        reported_user:profiles!reports_reported_user_id_fkey(
          id,
          username,
          full_name
        ),
        confession:confessions!reports_confession_id_fkey(
          id,
          title
        ),
        comment:comments!reports_comment_id_fkey(
          id,
          content
        )
      `, { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get pending reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending reports'
    });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    // Verify admin or moderator role
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (userError || !user || !['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Admin or moderator access required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    // Update report
    const { data: updatedReport, error } = await supabase
      .from('reports')
      .update({ 
        status,
        admin_notes: adminNotes,
        resolved_at: status !== 'pending' ? new Date().toISOString() : null,
        resolved_by: status !== 'pending' ? adminId : null
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: adminId,
      action: 'report_status_updated',
      target_type: 'report',
      target_id: reportId,
      metadata: { status, admin_notes: adminNotes }
    }]);

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report status'
    });
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  toggleUserBan,
  deleteUser,
  getPendingReports,
  updateReportStatus
};
