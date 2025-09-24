const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

function buildUserPayload(userDoc) {
  return {
    id: userDoc._id.toString(),
    username: userDoc.username,
    email: userDoc.email,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    role: userDoc.role,
    department: userDoc.department,
    studentId: userDoc.studentId,
    facultyId: userDoc.facultyId,
    course: userDoc.course,
    branch: userDoc.branch,
  };
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Admin login (from env only; no DB admin user)
    if (
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      username.toLowerCase() === process.env.ADMIN_USERNAME.toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const adminPayload = {
        id: 'admin-env',
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'User',
        role: 'admin',
      };

      const token = jwt.sign(adminPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      });

      return res.json({ success: true, token, user: adminPayload });
    }

    // Non-admin login against DB
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = buildUserPayload(user);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });

    res.json({ success: true, token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
