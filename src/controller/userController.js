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

userController.post("/register", async (req, res) => {
  try {
    let isEmailExist = await User.findOne({ Email: req.body.Email });
    if (isEmailExist) {
      sendResponse(res, 202, "Success", {
        message: "This Email Already Exists!",
        statusCode: 404,
      });
      return;
    }
    const code = generateOTP();
    const userCreated = await userServices.create({ ...req.body, otp: code });
    // Send OTP to the user's email
    const response = await sendMail(
      req.body.Email,
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

module.exports = userController;
