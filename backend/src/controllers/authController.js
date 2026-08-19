const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in the environment');
      return res.status(500).json({ error: 'Server auth configuration error' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
