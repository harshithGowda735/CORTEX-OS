const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const verifyEmailTemplate = require('../utils/verifyEmailTemplate');
const sendEmail = require('../config/sendEmail');
const generateOtp = require('../utils/generateOtp');
const generateAccessToken = require('../utils/generateAccessToken');
const generateRefreshToken = require('../utils/generateRefreshToken');

const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password',
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: 'Email already registered',
        error: true,
        success: false,
      });
    }

    const otp = generateOtp();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = new UserModel({
      name,
      email,
      password,
      otp,
      otp_expiry,
    });

    const save = await newUser.save();

    const emailContent = verifyEmailTemplate(name, otp);
    await sendEmail({
      to: email,
      subject: 'Verify your AgriHealthTraffic Account',
      html: emailContent,
    });

    return res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      error: false,
      success: true,
      data: {
        _id: save._id,
        email: save.email,
        name: save.name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const verifyEmailController = async (req, res) => {
  try {
    const { code, email } = req.body;

    if (!code || !email) {
      return res.status(400).json({
        message: 'Please provide verification code and email',
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: true,
        success: false,
      });
    }

    if (user.otp !== code) {
      return res.status(400).json({
        message: 'Invalid verification code',
        error: true,
        success: false,
      });
    }

    if (new Date() > user.otp_expiry) {
      return res.status(400).json({
        message: 'Verification code expired',
        error: true,
        success: false,
      });
    }

    user.verify_email = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    return res.json({
      message: 'Email verified successfully',
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'Invalid email or password',
        error: true,
        success: false,
      });
    }

    if (user.status !== 'active') {
      return res.status(400).json({
        message: 'Your account is ' + user.status,
        error: true,
        success: false,
      });
    }

    if (!user.verify_email) {
      return res.status(400).json({
        message: 'Please verify your email first',
        error: true,
        success: false,
      });
    }

    const checkPassword = await user.comparePassword(password);

    if (!checkPassword) {
      return res.status(400).json({
        message: 'Invalid email or password',
        error: true,
        success: false,
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refresh_token = refreshToken;
    await user.save();

    const cookieOptions = {
        httpOnly : true,
        secure : true,
        sameSite : "None"
    }

    res.cookie('accessToken',accessToken,cookieOptions)
    res.cookie('refreshToken',refreshToken,cookieOptions)

    return res.json({
      message: 'Login successful',
      error: false,
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const resendOtpController = async (req, res) => {
    try {
        const { email } = req.body;

        if(!email){
            return res.status(400).json({
                message : "Provide email",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email });

        if(!user){
            return res.status(404).json({
                message : "User not found",
                error : true,
                success : false
            })
        }

        const otp = generateOtp();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otp_expiry = otp_expiry;
        await user.save();

        const emailContent = verifyEmailTemplate(user.name, otp);
        await sendEmail({
            to: email,
            subject: 'Verify your AgriHealthTraffic Account',
            html: emailContent,
        });

        return res.json({
            message : "Verification code sent to email",
            error : false,
            success : true
        })
        
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

module.exports = {
  registerUserController,
  verifyEmailController,
  loginController,
  resendOtpController
};
