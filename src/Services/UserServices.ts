//import { User, IUser, UserType } from './Model/UserModel'; // Import User model from the models directory
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserType } from '../Model/UserModel';
import { IGetAllUsersWithPaginationSorting } from '../Controller/UserController';
import { getOtp, getOtpExpiryTime } from '../Helper/otp';

class UserService {
    
    // Create a new user
    public async createUser(userData: IUser): Promise<IUser> {
        const user = new User(userData);
        await user.save();
        return user.toObject();
    }


    // Find a user by email
    public async findUserByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email })
        //return User.findOne({ email }).lean();

    }

    // Find a user by email
    public async findUserByEmailV2(email: string): Promise<IUser | null> {
        //return User.findOne({ email })
        return User.findOne({ email }).lean();
    
    }


    // Find a user by phone
    public async findUserByPhone(phone: string): Promise<IUser | null> {
            return User.findOne({ phone });
    }

    // Find a user by ID
    public async findUserById(id: string): Promise<IUser | null> {
        return User.findById(id);
    }

    // Update user details
    public async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, userData, { new: true });
    }

    // Delete a user by ID
    public async deleteUser(id: string): Promise<IUser | null> {
        return User.findByIdAndDelete(id);
    }

    // Compare user passwords
    public async comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
        return user.comparePassword(candidatePassword);
    }

    // Create JWT token
    public async createJwtToken(user: IUser): Promise<string> {
        return user.createJwtToken();
    }


    // Create JWT token With Ip
    public async createJwtTokenIp(user: IUser,ipAdress:string): Promise<string> {
        return user.createJwtTokenWithIp(ipAdress);
    }

    // Handle forgot password (generating OTP)
    public async generateOtp(user: IUser, otp: string, otpExpiryTime: Date): Promise<IUser> {
        user.forgotPassword.otp = otp;
        user.forgotPassword.otpGeneratedTime = new Date();
        user.forgotPassword.otpExpiryTime = otpExpiryTime;

        await user.save();
        return user;
    }

    // Reset password (after verifying OTP)
    public async resetPassword(user: IUser, newPassword: string): Promise<IUser> {
        user.password = newPassword; // Set new password
        user.forgotPassword.otp = null; // Clear OTP
        await user.save();
        return user;
    }

    // Refresh JWT token (optional)
    public async refreshJwtToken(user: IUser): Promise<string> {
        // You may add logic to handle refresh token logic here if needed
        return user.createJwtToken(); // Reuse createJwtToken method for refreshing
    }

    public async getAllUsersWithPaginationSorting(reqBody: IGetAllUsersWithPaginationSorting): Promise<IUser[]> {
        return User.find().skip((reqBody.page - 1) * reqBody.limit).limit(reqBody.limit).sort({ [reqBody.sortField]: reqBody.sortOrder === 'ASC' ? 1 : -1 });
    }

    public async getTotalUsers(): Promise<number> {
        return User.countDocuments();
    }

    public async searchUser(searchField: string, search: string): Promise<IUser[]> {
        return User.find({ [searchField]: { $regex: search, $options: 'i' } });
    }

    public async userStatusUpdate(userId: string, status: boolean,user:IUser): Promise<IUser | null> {
        user.authorization.isBlocked = status;
        return user.save();
    }

    public async genrateLoginOtp(user:IUser,otp:string,otpExpiryTime:Date): Promise<IUser> {
        user.authorization.otp = otp;
        user.authorization.otpExpiryTime = otpExpiryTime;
        return user.save();
    }

    
}

export default UserService;
