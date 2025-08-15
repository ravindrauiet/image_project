const express = require('express');
const passport = require('passport');
const { db } = require('../database/database');

const router = express.Router();

// GitHub OAuth login
router.get('/github', passport.authenticate('github', { scope: ['user', 'repo'] }));

// GitHub OAuth callback
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Store or update user in database
      const { id, username, emails, photos, accessToken } = req.user;
      const email = emails && emails.length > 0 ? emails[0].value : null;
      const avatarUrl = photos && photos.length > 0 ? photos[0].value : null;

      // Check if user exists
      db.get('SELECT * FROM users WHERE github_id = ?', [id], (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.redirect('/login?error=database');
        }

        if (user) {
          // Update existing user
          db.run(
            'UPDATE users SET username = ?, email = ?, avatar_url = ?, access_token = ?, updated_at = CURRENT_TIMESTAMP WHERE github_id = ?',
            [username, email, avatarUrl, accessToken, id],
            (err) => {
              if (err) {
                console.error('Update error:', err);
              }
            }
          );
        } else {
          // Create new user
          db.run(
            'INSERT INTO users (github_id, username, email, avatar_url, access_token) VALUES (?, ?, ?, ?, ?)',
            [id, username, email, avatarUrl, accessToken],
            (err) => {
              if (err) {
                console.error('Insert error:', err);
              }
            }
          );
        }
      });

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('/login?error=auth');
    }
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Get current user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.emails?.[0]?.value,
        avatar: req.user.photos?.[0]?.value
      }
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  console.log('Auth status check:', {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? { id: req.user.id, username: req.user.username } : null,
    sessionData: {
      passport: req.session.passport,
      cookie: req.session.cookie
    }
  });
  
  res.json({ 
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user.id,
      username: req.user.username
    } : null
  });
});

module.exports = router;

