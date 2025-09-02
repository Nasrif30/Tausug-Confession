// server/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');

const generateToken = (userId) => {
  // Convert seconds to proper time format
  const expiresInSeconds = parseInt(process.env.JWT_EXPIRE) || 3600;
  const expiresIn = `${expiresInSeconds}s`;
  
  console.log('🔐 Token generation - JWT_EXPIRE:', process.env.JWT_EXPIRE, 'Using:', expiresIn, '(', expiresInSeconds, 'seconds)');
  
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn
    }
  );
  
  console.log('🔐 Token generated successfully for user:', userId);
  return token;
};

const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, username, fullName } = req.body;

    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('username, id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already exists',
        message: 'Please choose a different username'
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          full_name: fullName
        }
      });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({ 
        error: 'Registration failed',
        message: authError.message
      });
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username,
          full_name: fullName,
          role: 'user' // Default role, can be upgraded to 'member' later
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return res.status(400).json({ 
        error: 'Registration failed',
        message: 'Failed to create user profile'
      });
    }

    // Generate JWT token
    const token = generateToken(authData.user.id);

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: profile.id,
        action: 'user_registered',
        target_type: 'user',
        target_id: profile.id,
        metadata: { username, role: 'user' }
      }
    ]);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        createdAt: profile.created_at
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
};

const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth
      .signInWithPassword({ email, password });

    if (authError) {
      console.error('Login error:', authError);
      return res.status(400).json({ 
        error: 'Login failed',
        message: 'Invalid email or password'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(400).json({ 
        error: 'Login failed',
        message: 'User profile not found'
      });
    }

    // Generate JWT token
    const token = generateToken(authData.user.id);

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: profile.id,
        action: 'user_login',
        target_type: 'user',
        target_id: profile.id,
        metadata: { username: profile.username }
      }
    ]);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        createdAt: profile.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt:', { email, password: password ? '***' : 'missing' });

    // Validate input
    if (!email || !password) {
      console.log('Admin login validation failed: missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if this is the admin account
    if (email === 'alnasrif39@gmail.com') {
      console.log('Admin email matched, checking password...');
      console.log('Expected password: alnasrifnas30');
      console.log('Received password:', password);
      console.log('Password match:', password === 'alnasrifnas30');
      // Verify admin password (you can change this to whatever you want)
      if (password === 'alnasrifnas30') {
        // Get admin profile by username (since profiles table doesn't have email)
        const { data: admin, error: adminError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', 'Nas12')
          .eq('role', 'admin')
          .single();

        if (adminError) {
          if (adminError.code === 'PGRST116') {
            return res.status(401).json({
              success: false,
              error: 'Admin account not found'
            });
          }
          throw adminError;
        }

        if (!admin || admin.role !== 'admin') {
          return res.status(401).json({
            success: false,
            error: 'Access denied. Admin privileges required.'
          });
        }

        // Generate JWT token
        const token = generateToken(admin.id);
        console.log('🔐 Admin token generated for user ID:', admin.id);
        console.log('🔐 Token structure check:', { userId: admin.id, tokenLength: token.length });

        // Log admin login
        await supabase.from('activity_logs').insert([{
          user_id: admin.id,
          action: 'admin_login',
          target_type: 'user',
          target_id: admin.id,
          metadata: { method: 'email', email: email, username: admin.username }
        }]);

        res.json({
          success: true,
          message: 'Admin login successful',
          token,
          user: {
            id: admin.id,
            username: admin.username,
            fullName: admin.full_name,
            role: admin.role,
            avatarUrl: admin.avatar_url,
            bio: admin.bio,
            createdAt: admin.created_at,
            isAdmin: true
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid admin credentials'
        });
      }
    } else {
      // Not an admin email - return error
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message || 'Internal server error'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        fullName: req.user.full_name,
        role: req.user.role,
        avatarUrl: req.user.avatar_url,
        bio: req.user.bio,
        createdAt: req.user.created_at,
        updatedAt: req.user.updated_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: 'Internal server error'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, bio, avatarUrl } = req.body;
    const updates = {};

    if (fullName !== undefined) updates.full_name = fullName.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(400).json({ 
        error: 'Update failed',
        message: 'Failed to update profile'
      });
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: req.user.id,
        action: 'profile_updated',
        target_type: 'user',
        target_id: req.user.id,
        metadata: updates
      }
    ]);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Update failed',
      message: 'Internal server error'
    });
  }
};

const upgradeToMember = async (req, res) => {
  try {
    // Only allow users to upgrade themselves to member
    if (req.user.role !== 'user') {
      return res.status(400).json({
        error: 'Invalid upgrade',
        message: 'Only users can be upgraded to members'
      });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ role: 'member' })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Role upgrade error:', error);
      return res.status(400).json({
        error: 'Upgrade failed',
        message: 'Failed to upgrade to member'
      });
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: req.user.id,
        action: 'role_upgraded',
        target_type: 'user',
        target_id: req.user.id,
        metadata: { from_role: 'user', to_role: 'member' }
      }
    ]);

    res.json({
      message: 'Successfully upgraded to member! You can now create stories.',
      user: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        bio: profile.bio
      }
    });

  } catch (error) {
    console.error('Upgrade to member error:', error);
    res.status(500).json({
      error: 'Upgrade failed',
      message: 'Internal server error'
    });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // For now, we'll accept a URL in the request body
    // In a real implementation, you'd handle file upload
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({
        error: 'Avatar URL required',
        message: 'Please provide an avatar URL'
      });
    }

    // Update user's avatar
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Avatar update error:', error);
      return res.status(400).json({
        error: 'Update failed',
        message: 'Failed to update avatar'
      });
    }

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action: 'avatar_updated',
        target_type: 'user',
        target_id: userId,
        metadata: { avatar_url: avatarUrl }
      }
    ]);

    res.json({
      message: 'Avatar updated successfully',
      user: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        bio: profile.bio
      }
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  upgradeToMember,
  updateAvatar
};