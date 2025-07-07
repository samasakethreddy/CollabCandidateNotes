const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Track active sessions
const activeSessions = new Map();

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        console.log(`User registered: ${user.name} (${user.id})`);
        
        // Track session
        activeSessions.set(user.id, {
          token: token,
          createdAt: new Date(),
          userAgent: req.get('User-Agent')
        });
        
        res.json({ token, userId: user.id });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check for existing session
    const existingSession = activeSessions.get(user.id);
    if (existingSession) {
      console.log(`User ${user.name} already has an active session, creating new one`);
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        console.log(`User logged in: ${user.name} (${user.id})`);
        
        // Update session
        activeSessions.set(user.id, {
          token: token,
          createdAt: new Date(),
          userAgent: req.get('User-Agent')
        });
        
        res.json({ token, userId: user.id });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Clean up expired sessions
setInterval(() => {
  const now = new Date();
  for (const [userId, session] of activeSessions.entries()) {
    const sessionAge = now - session.createdAt;
    if (sessionAge > 3600000) { // 1 hour
      activeSessions.delete(userId);
      console.log(`Cleaned up expired session for user ${userId}`);
    }
  }
}, 300000); // Check every 5 minutes

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Remove session
    if (activeSessions.has(userId)) {
      activeSessions.delete(userId);
      console.log(`User ${req.user.name} logged out, session cleaned up`);
    }
    
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).send('Server error');
  }
};
