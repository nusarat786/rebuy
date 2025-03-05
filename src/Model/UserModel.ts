import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// Enum for user types
enum UserType {
    Admin = 'admin',
    User = 'user',
}

// Interface for the forgotPassword object
interface IForgotPassword {
    otp: string | null; // OTP, nullable by default
    otpGeneratedTime: Date; // Time when OTP is generated
    otpExpiryTime: Date; // Expiry time for OTP (15 minutes after generation)
}

// Interface for the authorization object
interface IAuthorization {
    jwtToken?: string;
    refreshToken?: string;
    loginDate?: Date;
    logoutDate?: Date | null;
    isBlocked?:boolean;
    otp?:string;
    otpExpiryTime?:Date;
}

interface IPremium {
    premiumStartDate: Date | null;
    premiumExpiryTime: Date | null;
    transactionId: string | null;
}

// Interface for the User document
interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string | null ;
    phoneCode: string | null;
    profilePicture?: string;
    userType: UserType;
    city?: string;
    region?: string;
    country?: string;
    zip?: string;
    createdAt: Date;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    authorization: IAuthorization;
    forgotPassword: IForgotPassword; // Forgot password related fields
    comparePassword: (candidatePassword: string) => Promise<boolean>;
    createJwtToken: () => string; // Method to create JWT token

    createJwtTokenWithIp: (ipAdress:string) => string; 
    totalProducts: number;
    premium: IPremium;
}

// User schema
const userSchema: Schema<IUser> = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, 'First name must be at least 3 characters'],
            maxlength: [50, 'First name must be at most 50 characters']
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, 'Last name must be at least 3 characters'],
            maxlength: [50, 'Last name must be at most 50 characters']
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/, 'Please fill a valid email address'],
            trim: true,
            maxlength: [50, 'Email must be at most 50 characters'],
            minlength: [5, 'Email must be at least 5 characters'],

        },
        password: {
            type: String,
            required: true,
            minlength: [8, 'Password must be at least 8 characters'],
            validate: {
                validator: function (value) {
                    // Only validate plain-text passwords
                    if (this.isModified('password')) {
                        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(value);
                    }
                    return true;
                },
                message:
                    'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.',
            },
            trim: true,
        },
        phone: {
            type: String,
            required: false,
            unique: false,
            match: [/^\d{10}$/, 'Please fill a valid phone number'],
            allowNull: true,
            sparse: true,  
        
        },
        phoneCode: {
            type: String,
            required: false,
            match: [/^\d{1,3}$/, 'Please provide a valid country code, e.g., 91 for India'],
            allowNull: true,


        },
        profilePicture: { type: String, default: '' },
        userType: {
            type: String,

            enum: Object.values(UserType),
            default: UserType.User,
        },
        city: { type: String, required: false, default: null },
        region: { type: String, required: false, default: null },
        country: { type: String, required: false, default: null },
        zip: { type: String, required: false, default: null },
        isPhoneVerified: { type: Boolean, required: false, default: false },
        isEmailVerified: { type: Boolean, required: false, default: false },
        authorization: {
            jwtToken: { type: String, default: null },
            refreshToken: { type: String, default: null },

            loginDate: { type: Date, default: null },
            logoutDate: { type: Date, default: null },
            isBlocked:{
                type:Boolean,
                default:false,
                required:false
            },
            otp: { type: String, default: null },
            otpExpiryTime: { type: Date, default: null },
        },
        forgotPassword: {
            otp: { type: String, default: null }, // OTP
            otpGeneratedTime: {
                type: Date,
                default: null,
                //default: Date.now 
            }, // Time of OTP generation
            otpExpiryTime: {
                type: Date,
                default: null
                //default: () => new Date(Date.now() + 15 * 60 * 1000) 
            }, // Expiry time (15 minutes after generation)
        },
        totalProducts: { type: Number, default: 0},
        createdAt: { type: Date, default: Date.now },
        premium: {
            premiumStartDate: { type: Date, default: null },
            premiumExpiryTime: { type: Date, default: null },
            transactionId: { type: String, default: null },
        },

    },
    { timestamps: true }


);

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
        console.log('Password Updated')
    }

    // try {
    //     const ip = '8.8.8.8';
    //     const geoLocation = await getLocationFromIP(ip);

    //     if (geoLocation) {
    //         this.city = geoLocation.city;
    //         this.region = geoLocation.region;
    //         this.country = geoLocation.country;
    //         this.zip = geoLocation.zip;
    //     }
    // } catch (error) {
    //     console.error('Failed to fetch geolocation:', error);
    // }

    next();
});

// Function to fetch location from IP
async function getLocationFromIP(ipAddress: string) {
    try {
        const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
        if (response.data.status === 'fail') {
            throw new Error('IP Geolocation failed');
        }
        const { city, regionName, country, zip } = response.data;
        return { city, region: regionName, country, zip };
    } catch (error) {
        console.error('Error fetching geolocation:', error);
        return null;
    }
}

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to create a JWT token
userSchema.methods.createJwtToken = async function () {
    const secretKey = process.env.JWT_SECRET || 'defaultSecretKey'; // Use an environment variable for security
    const expiresIn = process.env.JWT_EXPIRATION || '1h'; // Token expiration time
    const payload = {
        id: this._id,
        email: this.email,
        userType: this.userType,
    };

    const token = jwt.sign(payload, secretKey, { expiresIn });

    // Update the authorization object with JWT token and login date
    this.authorization.jwtToken = token;
    this.authorization.loginDate = new Date();
    //console.log('Token:', this.password);


    await this.save();

    return token;
};


// Instance method to create a JWT token
userSchema.methods.createJwtTokenWithIp = async function (ipAdress:string) {
    const secretKey = process.env.JWT_SECRET || 'defaultSecretKey'; // Use an environment variable for security
    const expiresIn = process.env.JWT_EXPIRATION || '1h'; // Token expiration time
    const payload = {
        id: this._id,
        email: this.email,
        userType: this.userType,
        ipAdress
    };

    const token = jwt.sign(payload, secretKey, { expiresIn });

    // Update the authorization object with JWT token and login date
    this.authorization.jwtToken = token;
    this.authorization.loginDate = new Date();
    //console.log('Token:', this.password);
    //console.log('Ip:', ipAdress);

    await this.save();

    return token;
};
// Apply unique constraint separately
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

const User = mongoose.model<IUser>('User', userSchema);

export { User, IUser, UserType };
