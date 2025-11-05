require('dotenv').config();
const mongoose = require('mongoose');

async function viewDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const User = require('./src/models/user.model');
    const Event = require('./src/models/event.model');
    const Registration = require('./src/models/registration.model');
    const Venue = require('./src/models/venue.model');

    console.log('\n========================================');
    console.log('DATABASE CONTENTS - COMPLETE OVERVIEW');
    console.log('========================================\n');

    // USERS
    console.log('--- USERS ---');
    const users = await User.find({}).select('-password');
    console.log('Total Users:', users.length);
    console.log('');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.role.toUpperCase()}: ${u.firstName} ${u.lastName}`);
      console.log('   Email:', u.email);
      console.log('   Username:', u.username);
      console.log('   MongoDB ID:', u._id.toString());
      if (u.studentId) console.log('   Student ID:', u.studentId);
      if (u.facultyId) console.log('   Faculty ID:', u.facultyId);
      if (u.course) console.log('   Course:', u.course);
      if (u.branch) console.log('   Branch:', u.branch);
      console.log('   Created:', new Date(u.createdAt).toLocaleString());
      console.log('');
    });

    // EVENTS
    console.log('--- EVENTS ---');
    const events = await Event.find({});
    console.log('Total Events:', events.length);
    console.log('');
    events.forEach((e, i) => {
      console.log(`${i + 1}. ${e.title}`);
      console.log('   Type:', e.type);
      console.log('   Status:', e.status);
      console.log('   Start:', new Date(e.startDate).toLocaleString());
      console.log('   End:', new Date(e.endDate).toLocaleString());
      console.log('   Max Participants:', e.maxParticipants);
      console.log('   Registered:', e.registeredCount);
      console.log('   MongoDB ID:', e._id.toString());
      console.log('   Venue ID:', e.venueId ? e.venueId.toString() : 'None');
      console.log('   Tags:', e.tags.join(', '));
      console.log('');
    });

    // VENUES
    console.log('--- VENUES ---');
    const venues = await Venue.find({});
    console.log('Total Venues:', venues.length);
    console.log('');
    venues.forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`);
      console.log('   Location:', v.location);
      console.log('   Capacity:', v.capacity);
      console.log('   Active:', v.isActive);
      console.log('   MongoDB ID:', v._id.toString());
      console.log('');
    });

    // REGISTRATIONS
    console.log('--- REGISTRATIONS ---');
    const regs = await Registration.find({}).populate('userId', 'firstName lastName email').populate('eventId', 'title');
    console.log('Total Registrations:', regs.length);
    console.log('');
    if (regs.length > 0) {
      regs.forEach((r, i) => {
        console.log(`${i + 1}. Registration`);
        console.log('   User:', r.userId ? `${r.userId.firstName} ${r.userId.lastName} (${r.userId.email})` : 'Unknown');
        console.log('   User ID:', r.userId ? r.userId._id.toString() : r.userId);
        console.log('   Event:', r.eventId ? r.eventId.title : 'Unknown');
        console.log('   Event ID:', r.eventId ? r.eventId._id.toString() : r.eventId);
        console.log('   Status:', r.status);
        console.log('   Attended:', r.attended || false);
        console.log('   Registered:', new Date(r.registeredAt).toLocaleString());
        console.log('');
      });
    } else {
      console.log('No registrations yet');
      console.log('');
    }

    console.log('========================================');
    console.log('DATABASE: event-management');
    console.log('Connection: MongoDB Atlas');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

viewDatabase();



