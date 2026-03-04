const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: Number,
  totalPrice: Number,
  status: {
    type: String,
    enum: ['interested', 'booked', 'completed', 'cancelled'],
    default: 'interested'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);