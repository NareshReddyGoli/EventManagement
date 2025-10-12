const EventMemory = require('../models/eventMemory.model');
const { uploadBase64Image } = require('../utils/cloudinary');

exports.create = async (req, res) => {
  try {
    let { content, type, ...rest } = req.body;

    // If type is photo and content is base64, upload to Cloudinary
    if (type === 'photo' && content && content.startsWith('data:image')) {
      try {
        content = await uploadBase64Image(content, 'event-memories');
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image' 
        });
      }
    }

    const memory = await EventMemory.create({ 
      ...rest,
      type,
      content,
      userId: req.user?.id || req.body.userId
    });

    const populated = await EventMemory.findById(memory._id)
      .populate('userId', 'firstName lastName email')
      .populate('eventId', 'title');

    res.status(201).json({ success: true, data: populated });
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
    if (req.query.approved !== undefined) filter.approved = req.query.approved === 'true';
    
    const items = await EventMemory.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('eventId', 'title')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const memory = await EventMemory.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('eventId', 'title')
      .populate('approvedBy', 'firstName lastName');
      
    if (!memory) return res.status(404).json({ success: false, message: 'Event memory not found' });
    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const memory = await EventMemory.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('userId', 'firstName lastName email')
      .populate('eventId', 'title');
      
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

// Approve a memory
exports.approve = async (req, res) => {
  try {
    const memory = await EventMemory.findByIdAndUpdate(
      req.params.id,
      {
        approved: true,
        approvedBy: req.user?.id,
        approvedAt: new Date(),
        isPublic: true,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null
      },
      { new: true }
    )
    .populate('userId', 'firstName lastName email')
    .populate('eventId', 'title')
    .populate('approvedBy', 'firstName lastName');

    if (!memory) {
      return res.status(404).json({ success: false, message: 'Event memory not found' });
    }

    res.json({ 
      success: true, 
      data: memory,
      message: 'Memory approved successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reject a memory
exports.reject = async (req, res) => {
  try {
    const { reason } = req.body;

    const memory = await EventMemory.findByIdAndUpdate(
      req.params.id,
      {
        approved: false,
        rejectedBy: req.user?.id,
        rejectedAt: new Date(),
        rejectionReason: reason || 'Not specified',
        isPublic: false,
        approvedBy: null,
        approvedAt: null
      },
      { new: true }
    )
    .populate('userId', 'firstName lastName email')
    .populate('eventId', 'title')
    .populate('rejectedBy', 'firstName lastName');

    if (!memory) {
      return res.status(404).json({ success: false, message: 'Event memory not found' });
    }

    res.json({ 
      success: true, 
      data: memory,
      message: 'Memory rejected'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get pending memories for approval
exports.getPending = async (req, res) => {
  try {
    const filter = { 
      approved: false,
      rejectedBy: null 
    };
    
    if (req.query.eventId) {
      filter.eventId = req.query.eventId;
    }

    const memories = await EventMemory.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: memories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
