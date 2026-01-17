export declare const generateOTP: () => string;
export declare const sendOTP: (email: string, otp: string) => Promise<void>;
export declare const verifyOTP: (generatedOTP: string, providedOTP: string) => boolean;
export declare const isOTPExpired: (otpExpiry: Date) => boolean;
//# sourceMappingURL=otpService.d.ts.map