const BookingModel = require('../models/BookingModel');

const createBooking = async (req, res) => {
    try {
        const { department, appointmentDate, timeSlot, reason } = req.body;
        const userId = req.userId; // Provided by Auth middleware

        if (!department || !appointmentDate || !timeSlot) {
            return res.status(400).json({
                message: "Please provide all required fields",
                error: true,
                success: false
            });
        }

        const newBooking = new BookingModel({
            user: userId,
            department,
            appointmentDate,
            timeSlot,
            reason
        });

        const savedBooking = await newBooking.save();

        return res.status(201).json({
            message: "Appointment booked successfully",
            data: savedBooking,
            success: true,
            error: false
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const userId = req.userId;
        const bookings = await BookingModel.find({ user: userId }).sort({ createdAt: -1 });

        return res.json({
            data: bookings,
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

module.exports = {
    createBooking,
    getUserBookings
};
