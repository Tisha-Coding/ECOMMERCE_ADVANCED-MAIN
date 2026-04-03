import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    // Normalise email: lowercase so User@Gmail.com and user@gmail.com are same
    email = (email || "").trim().toLowerCase();

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token, name: user.name });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Only allow @gmail.com emails
const isGmail = (email) => {
  const e = String(email || "").trim().toLowerCase();
  // strict: exactly one @ and must end with @gmail.com
  // local part can be: letters, numbers, dots, underscores, hyphens (1+ chars)
  return /^[a-zA-Z0-9._-]+@gmail\.com$/.test(e);
};

// Password: min 8 chars, at least one alphabet (a-z/A-Z), one digit (0-9) and one special character
const isStrongPassword = (password) => {
  const p = String(password || "").trim();
  if (p.length < 8) return false;
  const hasAlphabet = /[a-zA-Z]/.test(p);
  const hasDigit = /[0-9]/.test(p);
  const hasSpecial = /[^a-zA-Z0-9]/.test(p);
  return hasAlphabet && hasDigit && hasSpecial;
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Normalise: email lowercase, password as string
    email = (email || "").trim().toLowerCase();
    password = String(password ?? "").trim();

    // Check user already exists (by normalised email)
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Email: valid format and only @gmail.com allowed
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (!isGmail(email)) {
      return res.json({
        success: false,
        message: "Only Gmail addresses are allowed (e.g. you@gmail.com)",
      });
    }

    // Password: min 8 chars, must contain letters, numbers and special characters
    if (!isStrongPassword(password)) {
      return res.json({
        success: false,
        message:
          "Password must be at least 8 characters and contain letters, numbers and at least one special character",
      });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ sucess: false, message: "Invalid credentials" });
    }
  } catch (error) {}
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.body.userId; // from auth middleware
    const user = await userModel.findById(userId).select("-password -cartData");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user profile (name and phone only)
const updateProfile = async (req, res) => {
  try {
    const userId = req.body.userId; // from auth middleware
    const { name, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (phone !== undefined) {
      // Validate phone: 10 digits only
      const phoneStr = String(phone).replace(/[^0-9]/g, "");
      if (phoneStr.length > 0 && phoneStr.length !== 10) {
        return res.json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }
      updateData.phone = phoneStr;
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password -cartData");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Forgot Password - Send reset link via email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Normalize email
    const normalizedEmail = (email || "").trim().toLowerCase();
    
    if (!normalizedEmail) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Find user by email
    const user = await userModel.findOne({ email: normalizedEmail });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token before storing
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiry (15 minutes from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send email with reset link
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      await sendPasswordResetEmail(normalizedEmail, resetToken, frontendUrl);
      
      return res.json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (emailError) {
      // If email fails, clear the token (security: don't leave tokens hanging)
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      console.error("Email sending error:", emailError);
      console.error("Error stack:", emailError.stack);
      
      // Check if it's a configuration issue
      if (emailError.message.includes("not configured") || emailError.message.includes("EMAIL_USER")) {
        console.error("=".repeat(60));
        console.error("EMAIL SERVICE NOT CONFIGURED");
        console.error("Please set EMAIL_USER and EMAIL_PASSWORD in .env file");
        console.error("Reset link would have been:", `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`);
        console.error("=".repeat(60));
      }
      
      // Return generic error message (don't reveal if email exists or not)
      return res.json({
        success: false,
        message: "Failed to send password reset email. Please check your email configuration or try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({ success: false, message: error.message || "Something went wrong" });
  }
};

// Reset Password - Update password using token
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.json({
        success: false,
        message: "Token and password are required",
      });
    }

    // Hash the incoming token to compare with stored token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching token and check expiry
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return res.json({
        success: false,
        message:
          "Password must be at least 8 characters and contain letters, numbers and at least one special character",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.json({ success: false, message: error.message || "Something went wrong" });
  }
};

export { loginUser, registerUser, adminLogin, getProfile, updateProfile, forgotPassword, resetPassword };
