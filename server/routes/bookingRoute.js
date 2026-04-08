const express = require('express');
const { createBooking, getUserBookings } = require('../controllers/bookingController');
const auth = require('../middleware/Auth');

const bookingRouter = express.Router();

bookingRouter.post('/create', auth, createBooking);
bookingRouter.get('/user-bookings', auth, getUserBookings);

module.exports = bookingRouter;
