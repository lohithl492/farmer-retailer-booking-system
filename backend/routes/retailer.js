const express = require('express');
const Crop = require('../models/crop');
const Booking = require('../models/Booking');
const router = express.Router();

/* =====================================
   GET ALL AVAILABLE CROPS
===================================== */

router.get('/available-crops', async (req, res) => {
  try {

    const crops = await Crop.find({ isAvailable: true })
      .populate('farmerId', 'name phone location');

    res.json({ success: true, crops });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});

/* =====================================
   BOOK A CROP
===================================== */

router.post('/book-crop', async (req, res) => {

  try {

    const { cropId, farmerId, retailerId, quantity } = req.body;

    const crop = await Crop.findById(cropId);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    /* ================= QUANTITY VALIDATION ================= */

    if (quantity > crop.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough quantity available'
      });
    }

    /* ================= CREATE BOOKING REQUEST ================= */

    const booking = new Booking({
      cropId,
      farmerId,
      retailerId,
      quantity,
      totalPrice: crop.price * quantity,
      status: 'interested'
    });

    await booking.save();

    /* IMPORTANT:
       Quantity is NOT reduced here.
       Farmer will approve booking first.
    */

    res.json({
      success: true,
      message: 'Booking request sent to farmer',
      booking
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

/* =====================================
   GET RETAILER BOOKINGS
===================================== */

router.get('/my-bookings/:retailerId', async (req, res) => {

  try {

    const bookings = await Booking.find({ retailerId: req.params.retailerId })
      .populate('cropId')
      .populate('farmerId', 'name phone location');

    res.json({
      success: true,
      bookings
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

module.exports = router;