const Registration = require('../models/registration.model');
const Event = require('../models/event.model');

async function recalcEventRegisteredCount(eventId) {
  const approvedCount = await Registration.countDocuments({ eventId, status: 'approved' });
  await Event.findByIdAndUpdate(eventId, { registeredCount: approvedCount });
}

exports.create = async (req, res) => {
  try {
    const reg = await Registration.create({
      ...req.body,
    });
    
    // Update event registered count
    await recalcEventRegisteredCount(reg.eventId);
    
    res.status(201).json({ success: true, data: reg });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'User already registered for this event' });
    }
    console.error('Registration create error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.userId) filter.userId = req.query.userId;
    const regs = await Registration.find(filter);
    res.json({ success: true, data: regs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, data: reg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const prev = await Registration.findById(req.params.id);
    if (!prev) return res.status(404).json({ success: false, message: 'Registration not found' });

    const reg = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // If status changed affecting count, recalc
    if (req.body.status && prev.status !== req.body.status) {
      await recalcEventRegisteredCount(prev.eventId);
    }

    res.json({ success: true, data: reg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });

    await recalcEventRegisteredCount(reg.eventId);

    res.json({ success: true, message: 'Registration deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Return registrations for the authenticated user
exports.listMy = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const regs = await Registration.find({ userId });
    res.json({ success: true, data: regs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
