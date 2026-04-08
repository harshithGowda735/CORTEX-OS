const express = require('express');
const { createBooking, getUserBookings } = require('../controllers/bookingController');
const auth = require('../middleware/Auth');

const bookingRouter = express.Router();

bookingRouter.post('/create', createBooking);
bookingRouter.get('/user-bookings', getUserBookings);

module.exports = bookingRouter;
