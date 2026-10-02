const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    metaLeadId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED'],
      default: 'NEW',
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt automatic
  }
);

module.exports = mongoose.model('Lead', leadSchema);
