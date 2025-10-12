const Venue = require('../models/venue.model');

exports.create = async (req, res) => {
  try {
    console.log('Creating venue with data:', req.body);
    console.log('User:', req.user);
    
    // Handle admin user (from environment) - don't set createdBy for admin
    let venueData = { ...req.body };
    
    // Only set createdBy if user is from database (has valid ObjectId)
    if (req.user?.id && req.user.id !== 'admin-env') {
      venueData.createdBy = req.user.id;
    }
    // For admin-env, we'll leave createdBy undefined, which is fine
    
    const venue = await Venue.create(venueData);
    console.log('Venue created:', venue);
    
    res.status(201).json({ success: true, data: venue });
  } catch (error) {
    console.error('Venue creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json({ success: true, data: venues });
  } catch (error) {
    console.error('Venue list error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, data: venue });
  } catch (error) {
    console.error('Venue get error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    console.log('Updating venue:', req.params.id, req.body);
    
    const update = { ...req.body, updatedBy: req.user?.id };
    const venue = await Venue.findByIdAndUpdate(req.params.id, update, { new: true });
    
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    
    console.log('Venue updated:', venue);
    res.json({ success: true, data: venue });
  } catch (error) {
    console.error('Venue update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, message: 'Venue deleted' });
  } catch (error) {
    console.error('Venue delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
