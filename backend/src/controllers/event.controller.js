const Event = require('../models/event.model');
const Venue = require('../models/venue.model');

exports.create = async (req, res) => {
  try {
    console.log('Creating event with data:', req.body);
    console.log('User:', req.user);
    
    const payload = req.body;
    let eventData = { ...payload };
    
    // Only set createdBy if user is from database (has valid ObjectId)
    if (req.user?.id && req.user.id !== 'admin-env') {
      eventData.createdBy = req.user.id;
    } else if (payload.createdBy) {
      eventData.createdBy = payload.createdBy;
    }
    // For admin-env, we'll leave createdBy undefined, which is fine
    
    // Filter out admin-env from coordinators array
    if (eventData.coordinators && Array.isArray(eventData.coordinators)) {
      eventData.coordinators = eventData.coordinators.filter(coordId => 
        coordId !== 'admin-env' && coordId && coordId.toString().length === 24
      );
    }
    
    const event = await Event.create(eventData);
    console.log('Event created:', event);
    
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const events = await Event.find().populate('venueId').lean();
    // Transform populated venueId to venue object for frontend
    const eventsWithVenue = events.map(event => ({
      ...event,
      id: event._id.toString(),
      venue: event.venueId ? {
        id: event.venueId._id?.toString() || event.venueId,
        name: event.venueId.name,
        location: event.venueId.location,
        capacity: event.venueId.capacity,
        address: event.venueId.address,
        mapLink: event.venueId.mapLink
      } : null,
      venueId: event.venueId?._id?.toString() || event.venueId
    }));
    res.json({ success: true, data: eventsWithVenue });
  } catch (error) {
    console.error('Event list error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('venueId');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    // First, get the event to check permissions
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // If user is coordinator, check if they're assigned to this event
    if (req.user?.role === 'coordinator') {
      const isAssigned = event.coordinators.some(
        coordId => coordId.toString() === req.user.id.toString()
      );
      
      if (!isAssigned && event.createdBy && event.createdBy.toString() !== req.user.id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to update this event. Only assigned coordinators can update events.' 
        });
      }
    }

    // Update the event - only set updatedBy if user has a valid ObjectId
    const update = { ...req.body };
    if (req.user?.id && req.user.id !== 'admin-env' && req.user.id.length === 24) {
      update.updatedBy = req.user.id;
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
