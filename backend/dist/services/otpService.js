"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOTPExpired = exports.verifyOTP = exports.sendOTP = exports.generateOTP = void 0;
const nodemailer = __importStar(require("nodemailer"));
const crypto = __importStar(require("crypto"));
let transporter = null;
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
}
catch (error) {
    console.warn('Failed to create email transporter:', error);
}
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};
exports.generateOTP = generateOTP;
const sendOTP = async (email, otp) => {
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
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP email');
    }
};
exports.sendOTP = sendOTP;
const verifyOTP = (generatedOTP, providedOTP) => {
    return generatedOTP === providedOTP;
};
exports.verifyOTP = verifyOTP;
const isOTPExpired = (otpExpiry) => {
    return new Date() > otpExpiry;
};
exports.isOTPExpired = isOTPExpired;
//# sourceMappingURL=otpService.js.map