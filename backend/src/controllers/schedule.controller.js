const Schedule = require('../models/schedule.model');

exports.create = async (req, res) => {
  try {
    const schedule = await Schedule.create({
      ...req.body,
      createdBy: req.user?.id || req.body.createdBy,
    });
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    const schedules = await Schedule.find(filter);
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const update = { ...req.body, updatedBy: req.user?.id };
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
