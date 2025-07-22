const mongoose = require('mongoose');

const helperSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  serviceType: { type: String, required: true },
  organization: { type: String, required: true },
  languages: {
    type: [String],
    enum: ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada'],
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  phone: {
    type: String,
    match: /^\d{10}$/,
    required: true
  },
  email: {
    type: String,
    match: /.+\@.+\..+/,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['None', '2-wheeler', '4-wheeler', 'Other'],
    required: true
  },
  photoUrl: String,
  kycDocumentUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Helper', helperSchema);
