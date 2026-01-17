import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

// Create transporter (using Gmail as required)
let transporter: nodemailer.Transporter | null = null;

try {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
} catch (error) {
  console.warn('Failed to create email transporter:', error);
}

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOTP = async (email: string, otp: string): Promise<void> => {
  // For development/testing, log the OTP instead of sending email
  if (!transporter) {
    console.log(`Development: OTP for ${email} is: ${otp}`);
    console.log('Note: Email transporter not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env file.');
    return;
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Hostel Expense Management - OTP Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">OTP Verification</h2>
        <p>Thank you for registering with Hostel Expense Management!</p>
        <p>Your OTP code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; margin: 0; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully to:', email);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP email');
  }
};

export const verifyOTP = (generatedOTP: string, providedOTP: string): boolean => {
  return generatedOTP === providedOTP;
};

export const isOTPExpired = (otpExpiry: Date): boolean => {
  return new Date() > otpExpiry;
};