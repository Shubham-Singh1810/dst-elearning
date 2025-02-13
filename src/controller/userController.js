const express = require("express");
const { sendResponse, generateOTP, sendMail } = require("../utils/common");
require("dotenv").config();
const User = require("../model/user.Schema");
const userController = express.Router();
const request = require("request");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const moment = require("moment");

userController.post("/sign-up", async (req, res) => {
  try {
    let isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
      sendResponse(res, 202, "Success", {
        message: "This Email Already Exists!",
        statusCode: 404,
      });
      return;
    }
    const code = generateOTP();
    const userCreated = await User.create({ ...req.body, otp: code });
    // Send OTP to the user's email
    const response = await sendMail(
      req.body.email,
      "The OTP verification code is " + code + " for email verification."
    );
    sendResponse(res, 200, "Success", {
      message: "Registered successfully, please check your email!",
      data: userCreated,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});
userController.post("/resend-otp", async (req, res) => {
  try {
    const code = generateOTP();
    let userDetails = await User.findOne({ email: req.body.email });
    userDetails = await User.findByIdAndUpdate(userDetails.id, { opt: code }, { new: true });
    // Send OTP to the user's email
    const response = await sendMail(
      req.body.email,
      "The OTP verification code is " + code + " for email verification."
    );
    sendResponse(res, 200, "Success", {
      message: "Otp send successfully, please check your email!",
      data: userDetails,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});
userController.post("/verify-otp", async (req, res) => {
  try {
    let userDetails = await User.findOne({ email: req.body.email, otp: req.body.otp });
    if (!userDetails) {
      sendResponse(res, 202, "Success", {
        message: "Wrong OTP",
        statusCode: 404,
      });
      return;
    }
    // Generate JWT token for the new user
    const token = jwt.sign({ userId: userDetails._id, phoneNumber: userDetails.phoneNumber }, process.env.JWT_KEY);
    // Store the token in the user object or return it in the response
    userDetails.token = token;
    userDetails.isEmailVerified = true;
    userDetails = await User.findByIdAndUpdate(userDetails.id, { token }, { new: true });
    sendResponse(res, 200, "Success", {
      message: "OTP verified successfully",
      data: userDetails,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});
userController.post("/login", async (req, res) => {
  try {
    let userDetails = await User.findOne({ email: req.body.email, password: req.body.password });
    if (!userDetails) {
      sendResponse(res, 202, "Success", {
        message: "Invalid Credientials",
        statusCode: 404,
      });
      return;
    }
    if (!userDetails.isEmailVerified) {
      sendResponse(res, 202, "Success", {
        message: "Please verify your email",
        statusCode: 422,
      });
      return;
    }
    sendResponse(res, 200, "Success", {
      message: "User logged in successfully",
      data: userDetails,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = userController;
