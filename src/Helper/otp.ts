export const getOtp = ():string => Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

export const getOtpExpiryTime = ():Date => new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes
        