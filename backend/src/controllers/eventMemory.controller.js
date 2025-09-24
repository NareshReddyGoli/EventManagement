const EventMemory = require('../models/eventMemory.model');

exports.create = async (req, res) => {
  try {
    const memory = await EventMemory.create({ ...req.body });
    res.status(201).json({ success: true, data: memory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.isPublic !== undefined) filter.isPublic = req.query.isPublic === 'true';
    const items = await EventMemory.find(filter);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const memory = await EventMemory.findById(req.params.id);
    if (!memory) return res.status(404).json({ success: false, message: 'Event memory not found' });
    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const memory = await EventMemory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!memory) return res.status(404).json({ success: false, message: 'Event memory not found' });
    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const memory = await EventMemory.findByIdAndDelete(req.params.id);
    if (!memory) return res.status(404).json({ success: false, message: 'Event memory not found' });
    res.json({ success: true, message: 'Event memory deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
