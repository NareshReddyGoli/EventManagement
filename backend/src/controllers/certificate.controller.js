const { Certificate, CertificateTemplate } = require('../models/certificate.model');

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
    const certs = await Certificate.find(filter);
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
