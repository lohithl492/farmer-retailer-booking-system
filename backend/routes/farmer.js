const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const Crop = require("../models/crop");
const Booking = require("../models/Booking");

/* ================= IMAGE STORAGE ================= */

const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(null, "backend/uploads");
    },

    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({ storage });

/* ================= UPLOAD CROP ================= */

router.post("/upload-crop", upload.array("images", 5), async (req, res) => {

    try {

        const {
            farmerId,
            cropName,
            quantity,
            unit,
            price,
            location,
            harvestDate,
            description
        } = req.body;

        const imagePaths = req.files
            ? req.files.map(file => `/uploads/${file.filename}`)
            : [];

        const crop = new Crop({

            farmerId,
            cropName,
            quantity,
            unit,
            price,
            location,
            harvestDate,
            description,
            images: imagePaths,
            isAvailable: true,
            pricePerUnit: `₹${price}/${unit}`

        });

        await crop.save();

        res.json({
            success: true,
            crop
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

/* ================= GET MY CROPS ================= */

router.get("/my-crops/:farmerId", async (req, res) => {

    try {

        const crops = await Crop.find({ farmerId: req.params.farmerId });

        res.json({
            success: true,
            crops
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

/* ================= ALL CROPS ================= */

router.get("/all-crops", async (req, res) => {

    try {

        const crops = await Crop.find({ isAvailable: true })
        .populate("farmerId","name phone location");

        res.json({
            success: true,
            crops
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

/* ================= BOOKING REQUESTS ================= */

router.get("/booking-requests/:farmerId", async (req, res) => {

    try {

        const bookings = await Booking.find()
        .populate("cropId")
        .populate("retailerId","name")
        .populate("farmerId");

        const farmerBookings = bookings.filter(b =>
            b.farmerId._id.toString() === req.params.farmerId
        );

        res.json({
            success: true,
            bookings: farmerBookings
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

/* ================= UPDATE BOOKING STATUS ================= */

router.put("/update-booking-status/:id", async (req, res) => {

    try {

        const { status } = req.body;

        const booking = await Booking.findById(req.params.id)
        .populate("cropId");

        if (!booking) {
            return res.status(404).json({
                success:false,
                message:"Booking not found"
            });
        }

        const crop = await Crop.findById(booking.cropId._id);

        /* ================= APPROVE BOOKING ================= */

        if (status === "booked") {

            if (crop.quantity < booking.quantity) {

                return res.status(400).json({
                    success:false,
                    message:"Not enough quantity available"
                });

            }

            crop.quantity = crop.quantity - booking.quantity;

            if (crop.quantity === 0) {
                crop.isAvailable = false;
            }

            await crop.save();

            booking.status = "booked";
        }

        /* ================= REJECT BOOKING ================= */

        if (status === "cancelled") {
            booking.status = "cancelled";
        }

        await booking.save();

        res.json({
            success:true,
            booking
        });

    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

});

module.exports = router;