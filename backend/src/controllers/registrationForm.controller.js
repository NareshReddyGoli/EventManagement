const RegistrationForm = require('../models/registrationForm.model');

exports.create = async (req, res) => {
  try {
    const form = await RegistrationForm.create({
      ...req.body,
      createdBy: req.user?.id || req.body.createdBy,
    });
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const items = await RegistrationForm.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const form = await RegistrationForm.findById(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Registration form not found' });
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const form = await RegistrationForm.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true }
    );
    if (!form) return res.status(404).json({ success: false, message: 'Registration form not found' });
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const form = await RegistrationForm.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Registration form not found' });
    res.json({ success: true, message: 'Registration form deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
