const Event = require('../models/event.model');
const User = require('../models/user.model');
const Registration = require('../models/registration.model');
const Certificate = require('../models/certificate.model').Certificate;
const EventMemory = require('../models/eventMemory.model');
const Feedback = require('../models/feedback.model');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Count events by status
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ 
      status: { $in: ['published', 'ongoing'] },
      endDate: { $gte: new Date() }
    });
    const upcomingEvents = await Event.countDocuments({ 
      status: 'published',
      startDate: { $gt: new Date() }
    });
    const completedEvents = await Event.countDocuments({ status: 'completed' });

    // Count users by role
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCoordinators = await User.countDocuments({ role: 'coordinator' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Count registrations
    const totalRegistrations = await Registration.countDocuments();
    const approvedRegistrations = await Registration.countDocuments({ status: 'approved' });
    const pendingRegistrations = await Registration.countDocuments({ status: 'pending' });
    const attendedCount = await Registration.countDocuments({ attended: true });

    // Count certificates issued
    const totalCertificates = await Certificate.countDocuments();

    // Count memories
    const totalMemories = await EventMemory.countDocuments();
    const approvedMemories = await EventMemory.countDocuments({ approved: true });
    const pendingMemories = await EventMemory.countDocuments({ 
      approved: false,
      rejectedBy: null 
    });

    // Count feedback
    const totalFeedback = await Feedback.countDocuments();

    // Get average rating from feedback
    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      events: {
        total: totalEvents,
        active: activeEvents,
        upcoming: upcomingEvents,
        completed: completedEvents
      },
      users: {
        total: totalUsers,
        students: totalStudents,
        coordinators: totalCoordinators,
        admins: totalAdmins
      },
      registrations: {
        total: totalRegistrations,
        approved: approvedRegistrations,
        pending: pendingRegistrations,
        attended: attendedCount
      },
      certificates: {
        total: totalCertificates
      },
      memories: {
        total: totalMemories,
        approved: approvedMemories,
        pending: pendingMemories
      },
      feedback: {
        total: totalFeedback,
        averageRating: feedbackStats.length > 0 ? feedbackStats[0].averageRating : 0
      }
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get event-wise statistics
exports.getEventStats = async (req, res) => {
  try {
    const events = await Event.find()
      .select('title startDate endDate status maxParticipants')
      .sort({ startDate: -1 })
      .limit(20);

    const eventStats = await Promise.all(events.map(async (event) => {
      const registrations = await Registration.countDocuments({ eventId: event._id });
      const approved = await Registration.countDocuments({ 
        eventId: event._id, 
        status: 'approved' 
      });
      const attended = await Registration.countDocuments({ 
        eventId: event._id, 
        attended: true 
      });
      const certificates = await Certificate.countDocuments({ eventId: event._id });
      const memories = await EventMemory.countDocuments({ 
        eventId: event._id,
        approved: true 
      });
      const feedback = await Feedback.countDocuments({ eventId: event._id });
      
      const feedbackData = await Feedback.aggregate([
        { $match: { eventId: event._id } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' }
          }
        }
      ]);

      return {
        eventId: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        maxParticipants: event.maxParticipants,
        registrations,
        approved,
        attended,
        certificates,
        memories,
        feedback,
        averageRating: feedbackData.length > 0 ? feedbackData[0].averageRating : 0,
        attendanceRate: approved > 0 ? (attended / approved * 100).toFixed(2) : 0
      };
    }));

    res.json({ success: true, data: eventStats });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get registration trends (last 30 days)
exports.getRegistrationTrends = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await Registration.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({ success: true, data: trends });
  } catch (error) {
    console.error('Get registration trends error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get popular event types
exports.getEventTypeStats = async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalRegistrations: { $sum: '$registeredCount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get event type stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = exports;





