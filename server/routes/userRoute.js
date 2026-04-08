const express = require('express');
const {
  registerUserController,
  verifyEmailController,
  loginController,
  resendOtpController
} = require('../controllers/userController');

const userRouter = express.Router();

userRouter.post('/register', registerUserController);
userRouter.post('/verify-email', verifyEmailController);
userRouter.post('/login', loginController);
userRouter.post('/resend-otp', resendOtpController);

module.exports = userRouter;
