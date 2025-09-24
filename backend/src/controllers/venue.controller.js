const Venue = require('../models/venue.model');

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    const venue = await Venue.create({
      ...payload,
      createdBy: req.user?.id || payload.createdBy,
    });
    res.status(201).json({ success: true, data: venue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json({ success: true, data: venues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, data: venue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const update = { ...req.body, updatedBy: req.user?.id };
    const venue = await Venue.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, data: venue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, message: 'Venue deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
