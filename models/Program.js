const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  impact: {
    beneficiaries: Number,
    locations: [String]
  },
  imageUrl: String,
  featured: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Program', ProgramSchema);