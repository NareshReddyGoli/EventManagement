const { Certificate, CertificateTemplate } = require('../models/certificate.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const Registration = require('../models/registration.model');
const { generateCertificate, generateCertificateFilename, getCertificatesDir } = require('../utils/pdf');
const path = require('path');
const fs = require('fs');

exports.createTemplate = async (req, res) => {
  try {
    const tpl = await CertificateTemplate.create({
      ...req.body,
      createdBy: req.user?.id || req.body.createdBy,
    });
    res.status(201).json({ success: true, data: tpl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.listTemplates = async (req, res) => {
  try {
    const items = await CertificateTemplate.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const tpl = await CertificateTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tpl) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: tpl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeTemplate = async (req, res) => {
  try {
    const tpl = await CertificateTemplate.findByIdAndDelete(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.issue = async (req, res) => {
  try {
    const cert = await Certificate.create({ ...req.body });
    res.status(201).json({ success: true, data: cert });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Certificate already issued for this user/event' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.userId) filter.userId = req.query.userId;
    const certs = await Certificate.find(filter)
      .populate('eventId', 'title startDate')
      .populate('userId', 'firstName lastName email');
    res.json({ success: true, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Generate and issue certificate for a user for an event
exports.generate = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ eventId, userId });
    if (existingCert) {
      return res.status(409).json({ 
        success: false, 
        message: 'Certificate already exists for this user and event',
        data: existingCert 
      });
    }

    // Get event details
    const event = await Event.findById(eventId).populate('venueId');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user attended the event
    const registration = await Registration.findOne({ eventId, userId });
    if (!registration || !registration.attended) {
      return res.status(400).json({ 
        success: false, 
        message: 'User did not attend this event' 
      });
    }

    // Get or create default template
    let template = await CertificateTemplate.findOne({ isDefault: true });
    if (!template) {
      template = await CertificateTemplate.findOne();
    }

    // Generate certificate number
    const certificateNumber = `CERT-${event.id}-${user.id}-${Date.now()}`;

    // Prepare certificate data
    const certificateData = {
      userName: `${user.firstName} ${user.lastName}`,
      eventName: event.title,
      eventDate: new Date(event.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      certificateNumber: certificateNumber,
      issuedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    // Generate PDF
    const filename = generateCertificateFilename(certificateNumber);
    const outputPath = path.join(getCertificatesDir(), filename);
    
    await generateCertificate(certificateData, outputPath);

    // Create certificate record
    const certificate = await Certificate.create({
      eventId,
      userId,
      templateId: template?._id,
      certificateNumber,
      issuedBy: req.user?.id || userId,
      downloadUrl: `/certificates/${filename}`
    });

    res.status(201).json({ 
      success: true, 
      data: certificate,
      message: 'Certificate generated successfully'
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate certificate' });
  }
};

// Download certificate PDF
exports.download = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('eventId', 'title')
      .populate('userId', 'firstName lastName');
    
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Extract filename from downloadUrl
    const filename = cert.downloadUrl.split('/').pop();
    const filePath = path.join(getCertificatesDir(), filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Certificate file not found' });
    }

    // Send file
    res.download(filePath, `certificate_${cert.certificateNumber}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ success: false, message: 'Failed to download certificate' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Bulk generate certificates for all attendees of an event
exports.bulkGenerate = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get all attendees
    const registrations = await Registration.find({ 
      eventId, 
      attended: true 
    }).populate('userId');

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    for (const reg of registrations) {
      try {
        // Check if certificate already exists
        const existing = await Certificate.findOne({ 
          eventId, 
          userId: reg.userId._id 
        });

        if (existing) {
          results.skipped.push({
            userId: reg.userId._id,
            userName: `${reg.userId.firstName} ${reg.userId.lastName}`,
            reason: 'Certificate already exists'
          });
          continue;
        }

        // Generate certificate
        const generateResult = await exports.generateForUser(
          eventId, 
          reg.userId._id, 
          req.user?.id
        );

        results.success.push({
          userId: reg.userId._id,
          userName: `${reg.userId.firstName} ${reg.userId.lastName}`,
          certificateId: generateResult._id
        });

      } catch (error) {
        results.failed.push({
          userId: reg.userId._id,
          userName: `${reg.userId.firstName} ${reg.userId.lastName}`,
          error: error.message
        });
      }
    }

    res.json({ 
      success: true, 
      data: results,
      message: `Generated ${results.success.length} certificates, skipped ${results.skipped.length}, failed ${results.failed.length}`
    });

  } catch (error) {
    console.error('Bulk generate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function for generating certificate (used internally)
exports.generateForUser = async (eventId, userId, issuedBy) => {
  const event = await Event.findById(eventId);
  const user = await User.findById(userId);
  
  let template = await CertificateTemplate.findOne({ isDefault: true });
  if (!template) {
    template = await CertificateTemplate.findOne();
  }

  const certificateNumber = `CERT-${eventId}-${userId}-${Date.now()}`;

  const certificateData = {
    userName: `${user.firstName} ${user.lastName}`,
    eventName: event.title,
    eventDate: new Date(event.startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    certificateNumber: certificateNumber,
    issuedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  const filename = generateCertificateFilename(certificateNumber);
  const outputPath = path.join(getCertificatesDir(), filename);
  
  await generateCertificate(certificateData, outputPath);

  const certificate = await Certificate.create({
    eventId,
    userId,
    templateId: template?._id,
    certificateNumber,
    issuedBy,
    downloadUrl: `/certificates/${filename}`
  });

  return certificate;
};
