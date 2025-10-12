const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const { sendSMS, sendBulkSMS, formatPhoneNumber } = require('../utils/sms');

// Send SMS notification to specific users
exports.send = async (req, res) => {
  try {
    const { message, userIds, eventId } = req.body;

    if (!message || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message and userIds array are required' 
      });
    }

    // Get users with phone numbers
    const users = await User.find({ _id: { $in: userIds } });
    
    // Prepare recipients
    const recipients = users.map(user => ({
      userId: user._id,
      phone: user.phone || null,
      email: user.email,
      status: 'pending'
    })).filter(r => r.phone); // Only include users with phone numbers

    if (recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No users with valid phone numbers found' 
      });
    }

    // Create notification record
    const notification = await Notification.create({
      eventId: eventId || null,
      message,
      type: 'sms',
      recipients,
      totalRecipients: recipients.length,
      sentBy: req.user?.id,
      status: 'processing'
    });

    // Send SMS in background (don't wait)
    processSMSNotification(notification._id).catch(err => {
      console.error('SMS processing error:', err);
    });

    res.status(201).json({ 
      success: true, 
      data: notification,
      message: 'SMS notification is being processed'
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send SMS to all registered users of an event
exports.sendToEvent = async (req, res) => {
  try {
    const { message, eventId } = req.body;

    if (!message || !eventId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message and eventId are required' 
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get all registered users
    const registrations = await Registration.find({ 
      eventId, 
      status: 'approved' 
    }).populate('userId');

    const userIds = registrations.map(r => r.userId._id);
    const users = registrations.map(r => r.userId);

    // Prepare recipients
    const recipients = users.map(user => ({
      userId: user._id,
      phone: user.phone || null,
      email: user.email,
      status: 'pending'
    })).filter(r => r.phone);

    if (recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No registered users with valid phone numbers found' 
      });
    }

    // Create notification record
    const notification = await Notification.create({
      eventId,
      message,
      type: 'sms',
      recipients,
      totalRecipients: recipients.length,
      sentBy: req.user?.id,
      status: 'processing'
    });

    // Process SMS in background
    processSMSNotification(notification._id).catch(err => {
      console.error('SMS processing error:', err);
    });

    res.status(201).json({ 
      success: true, 
      data: notification,
      message: `SMS notification is being sent to ${recipients.length} participants`
    });

  } catch (error) {
    console.error('Send to event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all notifications
exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const notifications = await Notification.find(filter)
      .populate('eventId', 'title')
      .populate('sentBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single notification
exports.get = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('eventId', 'title')
      .populate('sentBy', 'firstName lastName email');

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete notification
exports.remove = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Background function to process SMS notifications
async function processSMSNotification(notificationId) {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) return;

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < notification.recipients.length; i++) {
      const recipient = notification.recipients[i];
      
      try {
        const formattedPhone = formatPhoneNumber(recipient.phone);
        await sendSMS(formattedPhone, notification.message);
        
        notification.recipients[i].status = 'sent';
        notification.recipients[i].sentAt = new Date();
        successCount++;
        
      } catch (error) {
        notification.recipients[i].status = 'failed';
        notification.recipients[i].error = error.message;
        failedCount++;
      }
    }

    notification.successCount = successCount;
    notification.failedCount = failedCount;
    notification.status = failedCount === notification.recipients.length ? 'failed' : 'completed';
    
    await notification.save();

  } catch (error) {
    console.error('Process SMS notification error:', error);
    
    // Update notification status to failed
    await Notification.findByIdAndUpdate(notificationId, {
      status: 'failed'
    });
  }
}

module.exports = exports;





