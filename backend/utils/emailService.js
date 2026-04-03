import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file");
  }

  // For development/testing, use Gmail SMTP
  // In production, use a service like SendGrid, AWS SES, etc.
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Gmail App Password (not regular password)
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, frontendUrl) => {
  try {
    // Validate inputs
    if (!email || !resetToken || !frontendUrl) {
      throw new Error("Missing required parameters for email");
    }

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 15 minutes.
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
      text: `Password Reset Request\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.`,
    };

    const transporter = createTransporter();
    
    // Verify connection before sending
    await transporter.verify();
    console.log("Email server connection verified");
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    
    // Provide more specific error messages
    if (error.message.includes("credentials not configured")) {
      throw new Error("Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file");
    } else if (error.code === "EAUTH") {
      throw new Error("Email authentication failed. Please check your Gmail App Password");
    } else if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
      throw new Error("Could not connect to email server. Please check your internet connection");
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
};
