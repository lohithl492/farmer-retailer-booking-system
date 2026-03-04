const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  pricePerUnit: String,
  description: String,
  images: [String],
  location: String,
  harvestDate: Date,
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Crop', cropSchema);