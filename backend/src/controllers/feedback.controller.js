const Feedback = require('../models/feedback.model');

exports.create = async (req, res) => {
  try {
    const fb = await Feedback.create({ ...req.body });
    res.status(201).json({ success: true, data: fb });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Feedback already submitted for this event' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    const items = await Feedback.find(filter);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: fb });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndDelete(req.params.id);
    if (!fb) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
