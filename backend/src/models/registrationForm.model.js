const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'email', 'number', 'select', 'textarea', 'checkbox', 'radio'],
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  placeholder: {
    type: String,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String,
    trim: true
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String
  }
});

const registrationFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fields: [formFieldSchema],
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Ensure only one default form exists
registrationFormSchema.pre('save', async function(next) {
  if (this.isDefault) {
    try {
      await mongoose.model('RegistrationForm').updateMany(
        { _id: { $ne: this._id }, isDefault: true },
        { $set: { isDefault: false } }
      );
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const RegistrationForm = mongoose.model('RegistrationForm', registrationFormSchema);

module.exports = RegistrationForm;
