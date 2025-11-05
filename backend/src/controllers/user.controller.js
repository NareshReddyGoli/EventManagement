const User = require('../models/user.model');

// Public: create student only
exports.createStudent = async (req, res) => {
  try {
    const { role, username, email, password, firstName, lastName, department, studentId, facultyId, course, branch } = req.body;

    // Force student role on public endpoint
    if (role === 'admin' || role === 'coordinator') {
      return res.status(400).json({ success: false, message: 'Only student signup is allowed' });
    }

    const exists = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
    if (exists) {
      return res.status(409).json({ success: false, message: 'User with username/email already exists' });
    }

    const user = await User.create({
      role: 'student',
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      department,
      studentId,
      facultyId,
      course,
      branch,
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin-only: create coordinator accounts
exports.createCoordinator = async (req, res) => {
  try {
    const { username, password, firstName, lastName, course, branch, coordinatorEventType, department, email } = req.body;

    if (!username || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'username, password, firstName, lastName are required' });
    }

    const normalizedUsername = username.toLowerCase();
    const normalizedEmail = (email ? email : `${normalizedUsername}@university.local`).toLowerCase();

    const exists = await User.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] });
    if (exists) {
      return res.status(409).json({ success: false, message: 'User with username/email already exists' });
    }

    const user = await User.create({
      role: 'coordinator',
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      firstName,
      lastName,
      department,
      course,
      branch,
      coordinatorEventType,
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { role, password, ...rest } = req.body;
    if (role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot set role to admin' });
    }

    const payload = { ...rest };
    if (password) payload.password = password; // will be hashed by pre-save if using save; but findByIdAndUpdate bypasses hooks

    // Use save to trigger hooks when password changes
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    Object.assign(user, payload);
    if (role) user.role = role;
    await user.save();

    res.json({ success: true, data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
