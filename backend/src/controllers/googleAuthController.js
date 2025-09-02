// server/src/controllers/googleAuthController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: 'Google token required',
        message: 'Please provide a valid Google ID token'
      });
    }

    // Verify Google token
    const payload = await verifyGoogleToken(idToken);
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists
    let { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('google_id', googleId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    let user;
    let isNewUser = false;

    if (existingUser) {
      // User exists, update last login
      const { data: updatedUser, error: updateError } = await supabase
        .from('profiles')
        .update({
          last_login: new Date().toISOString(),
          login_count: existingUser.login_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updatedUser;

      // Log activity
      await supabase.from('activity_logs').insert([
        {
          user_id: user.id,
          action: 'user_login',
          target_type: 'user',
          target_id: user.id,
          metadata: { method: 'google', username: user.username }
        }
      ]);
    } else {
      // Check if email already exists with different auth method
      const { data: emailUser, error: emailError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', email)
        .single();

      if (emailUser) {
        return res.status(400).json({
          error: 'Email already exists',
          message: 'An account with this email already exists. Please use the original login method.'
        });
      }

      // Create new user
      const username = `user_${Date.now()}`;
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            google_id: googleId,
            username,
            full_name: name,
            avatar_url: picture,
            email_verified: true,
            role: 'user',
            last_login: new Date().toISOString(),
            login_count: 1
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
      isNewUser = true;

      // Log activity
      await supabase.from('activity_logs').insert([
        {
          user_id: user.id,
          action: 'user_registered',
          target_type: 'user',
          target_id: user.id,
          metadata: { method: 'google', username, role: 'user' }
        }
      ]);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: isNewUser ? 'User registered successfully' : 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
        isNewUser
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message || 'Internal server error'
    });
  }
};

const linkGoogleAccount = async (req, res) => {
  try {
    const { idToken } = req.body;
    const { id: userId } = req.user;

    if (!idToken) {
      return res.status(400).json({
        error: 'Google token required',
        message: 'Please provide a valid Google ID token'
      });
    }

    // Verify Google token
    const payload = await verifyGoogleToken(idToken);
    const { sub: googleId, email, name, picture } = payload;

    // Check if Google account is already linked to another user
    const { data: existingGoogleUser, error: googleError } = await supabase
      .from('profiles')
      .select('id')
      .eq('google_id', googleId)
      .single();

    if (existingGoogleUser && existingGoogleUser.id !== userId) {
      return res.status(400).json({
        error: 'Google account already linked',
        message: 'This Google account is already linked to another user'
      });
    }

    // Link Google account to current user
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        google_id: googleId,
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log activity
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action: 'google_account_linked',
        target_type: 'user',
        target_id: userId,
        metadata: { google_id: googleId }
      }
    ]);

    res.json({
      message: 'Google account linked successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatar_url,
        bio: updatedUser.bio,
        googleLinked: true
      }
    });

  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({
      error: 'Failed to link Google account',
      message: error.message || 'Internal server error'
    });
  }
};

module.exports = {
  googleAuth,
  linkGoogleAccount
};
