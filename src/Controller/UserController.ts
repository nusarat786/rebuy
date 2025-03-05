import { NextFunction, Request, Response } from "express";

import UserServices from "../Services/UserServices";
import { User, IUser, UserType } from "../Model/UserModel";
import upload from "../Helper/multer";
import multer from "multer";
import { uploadSingleFileToCloudinary } from "../Helper/cloudry";
import { ApiResponse } from "../Helper/apiResponse";
import getClientIp from "../Helper/getIp";
import { getOtp, getOtpExpiryTime } from "../Helper/otp";
import dotenv from "dotenv";
import { sendMail } from "../Helper/nodeMailer";
import passport from 'passport';
import uploadV2 from "../Helper/multerV2";

dotenv.config();


interface IResetPassword {
    email: string;
    password: string;
    otp: string
}

export interface ISearchBody {
    search: string;
    searchField: string;
}

export interface IGetAllUsersWithPaginationSorting {
    page: number;
    limit: number;
    sortField: string;
    sortOrder: 'ASC' | 'DESC';
}

export class UserController {

    private userServices: UserServices;

    constructor(){
        this.userServices = new UserServices();
    }


    public register = async (req: Request<{}, {}, IUser>, res: Response, next: NextFunction) => {
        upload.single('profilePicture')(req, res, async (err) => {

            if (err) {
                // multer error handling
                return next(err);
            }

            try {

                const data: IUser = req.body;

                if (!data.firstName || !data.lastName || !data.email || !data.password || !data.phone || !data.phoneCode) {
                    throw new Error('firstName, lastName, email, password, phone and phoneCode are required and con not be blank');
                }

                const userWithMailExists = await this.userServices.findUserByEmail(data.email);

                if (userWithMailExists) {
                    throw new Error('User with this email already exists');
                }

                const userWithPhoneExists = await this.userServices.findUserByPhone(data.phone);

                if (userWithPhoneExists) {
                    throw new Error('User with this phone number already exists');
                }

                if (!req.file) {
                    throw new Error('Profile Picture is required (profilePicture)');
                }

                if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
                    throw new Error('Profile Picture must be in either JPEG or PNG format');
                }

                if (data.firstName.length < 3 || data.firstName.length > 50) {
                    throw new Error('First Name must be between 3 and 50 characters');
                }

                if (data.lastName.length < 3 || data.lastName.length > 50) {
                    throw new Error('Last Name must be between 3 and 50 characters');
                }

                if (data.email.length < 5 || data.email.length > 50) {
                    throw new Error('Email must be between 5 and 50 characters');
                }

                if (data.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/) === null) {
                    throw new Error('Please provide a valid email address');
                }

                if (data.password.length < 8) {
                    throw new Error('Password must be at least 8 characters');
                }

                if (data.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/) === null) {
                    throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.');
                }

                if (data.phone.match(/^\d{10}$/) === null) {
                    throw new Error('Please provide a valid phone number with 10 digits');
                }

                if (data.phoneCode.match(/^\d{1,3}$/) === null) {
                    throw new Error('Please provide a valid country code (1-3 digits), e.g., 91 for India');
                }
                
                if (req.file) {

                    const cloudinaryUrl = await uploadSingleFileToCloudinary(req.file.path, 'user_profiles');
                    data.profilePicture = cloudinaryUrl;
                }

                const newUser: IUser = await this.userServices.createUser(data);

                res.status(200).json(new ApiResponse(201, 'Registration completed successfully', newUser));

            } catch (error) {
                next(error);
            }
        });
    };

    // public registerV2 = async (req: Request<{}, {}, IUser>, res: Response, next: NextFunction) => {
    //     uploadV2.single('profilePicture')(req, res, async (err) => {
    

    //         if (err) {
    //             // multer error handling
    //             return next(err);
    //         }
    
    //         try {
    //             const data: IUser = req.body;
    
    //             if (!data.firstName || !data.lastName || !data.email || !data.password || !data.phone || !data.phoneCode) {
    //                 throw new Error('firstName, lastName, email, password, phone, and phoneCode are required and cannot be blank');
    //             }
    
    //             const userWithMailExists = await this.userServices.findUserByEmail(data.email);
    //             if (userWithMailExists) {
    //                 throw new Error('User with this email already exists');
    //             }
    
    //             const userWithPhoneExists = await this.userServices.findUserByPhone(data.phone);
    //             if (userWithPhoneExists) {
    //                 throw new Error('User with this phone number already exists');
    //             }
    
    //             if (!req.file) {
    //                 throw new Error('Profile Picture is required (profilePicture)');
    //             }
    
    //             if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
    //                 throw new Error('Profile Picture must be in either JPEG or PNG format');
    //             }
    
    //             if (data.firstName.length < 3 || data.firstName.length > 50) {
    //                 throw new Error('First Name must be between 3 and 50 characters');
    //             }
    
    //             if (data.lastName.length < 3 || data.lastName.length > 50) {
    //                 throw new Error('Last Name must be between 3 and 50 characters');
    //             }
    
    //             if (data.email.length < 5 || data.email.length > 50) {
    //                 throw new Error('Email must be between 5 and 50 characters');
    //             }
    
    //             if (data.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/) === null) {
    //                 throw new Error('Please provide a valid email address');
    //             }
    
    //             if (data.password.length < 8) {
    //                 throw new Error('Password must be at least 8 characters');
    //             }
    
    //             if (data.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/) === null) {
    //                 throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.');
    //             }
    
    //             if (data.phone.match(/^\d{10}$/) === null) {
    //                 throw new Error('Please provide a valid phone number with 10 digits');
    //             }
    
    //             if (data.phoneCode.match(/^\d{1,3}$/) === null) {
    //                 throw new Error('Please provide a valid country code (1-3 digits)');
    //             }
    
    //             if (req.file) {
    //                 const cloudinaryUrl = await uploadSingleFileToCloudinary(req.file.buffer, 'user_profiles');
    //                 data.profilePicture = cloudinaryUrl;
    //             }
    
    //             const newUser: IUser = await this.userServices.createUser(data);
    
    //             res.status(201).json(new ApiResponse(201, 'Registration completed successfully', newUser));
    
    //         } catch (error) {
    //             next(error);
    //         }
    //     });
    // };
    


    public login = async (req: Request<{}, {}, Partial<IUser>>, res: Response, next: NextFunction) => {

        try {

            const {email,password} = req.body;

            if ( !email || !password ) {
                throw new Error(' email and password required and can not be blank');
            }

            if (email.length < 5 || email.length > 50) {
                throw new Error('Email must be between 5 and 50 characters');
            }

            if (email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/) === null) {
                throw new Error('Please provide a valid email address');
            }

            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }

            if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/) === null) {
                throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.');
            }

            const user: IUser | null = await this.userServices.findUserByEmail(email);
            
            if (!user) {
                throw new Error('User not found with this email/password');
            }

            if(user.authorization.isBlocked){
                throw new Error('You Have Been Blocked For Suspiceous Activity')
            }

            const isPasswordMatch = await this.userServices.comparePassword(user, password);

            if(!isPasswordMatch){
                throw new Error('Password/Email is incorrect');
            }

            if(user.userType === UserType.Admin){
                throw new Error('Admin can not login here');
            }

            const token = await this.userServices.createJwtToken(user);

            res.status(200).json(new ApiResponse(200, 'User logged in successfully', {token,user}));
           
        } catch (error) {
            next(error);
        }
    
    };

    public loginWithIp = async (req: Request<{}, {}, Partial<IUser>>, res: Response, next: NextFunction) => {

        try {

            //console.log(req.ip)
            const ip = getClientIp(req);

            const {email,password} = req.body;

            if ( !email || !password ) {
                throw new Error(' email and password required and can not be blank');
            }

            if (email.length < 5 || email.length > 50) {
                throw new Error('Email must be between 5 and 50 characters');
            }

            if (email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/) === null) {
                throw new Error('Please provide a valid email address');
            }

            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }

            if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/) === null) {
                throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.');
            }

            const user: IUser | null = await this.userServices.findUserByEmail(email);
            
            if (!user) {
                throw new Error('User not found with this email/password');
            }

            const isPasswordMatch = await this.userServices.comparePassword(user, password);

            if(!isPasswordMatch){
                throw new Error('Password/Email is incorrect');
            }

            if(user.userType === UserType.Admin){
                throw new Error('Admin can not login here');
            }

            const token = await this.userServices.createJwtTokenIp(user,ip);

            res.status(200).json(new ApiResponse(200, 'User logged in successfully', {token,user}));

        } catch (error) {
            next(error);
        }
    
    };

    public forgotPassword = async (req: Request<{}, {}, Partial<IUser>>, res: Response, next: NextFunction) => {

        try {

            const {email} = req.body;

            if ( !email ) {
                throw new Error('email can not be blank');
            }

            if (email.length < 5 || email.length > 50) {
                throw new Error('Email must be between 5 and 50 characters');
            }

            if (email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/) === null) {
                throw new Error('Please provide a valid email address');
            }

            const user: IUser | null = await this.userServices.findUserByEmail(email);
            
            if (!user) {
                throw new Error('User not found with this email/password');
            }

            if(user.userType === UserType.Admin){
                throw new Error('Admin can not perform forgot password here');
            }

            const otp = getOtp();
            const otpExpiryTime = getOtpExpiryTime();

            const result = await sendMail(
                process.env.SMTP_MAIL || '', 
                user.email,
                'Password Reset OTP',
                `Your OTP for OLX-Clone password reset  is ${otp} and it will expire in 15 minutes`, 
                process.env.SMTP_MAIL || '', 
                process.env.SMTP_PASSWORD || ''
            );    
        

            const updatedUser = await this.userServices.generateOtp(user,otp,otpExpiryTime);

            res.status(200).json(new ApiResponse(200, 'OTP sent successfully', {updatedUser,result}));

        } catch (error) {
            next(error);
        }
    }

    public resetPassword = async (req: Request<{}, {}, IResetPassword>, res: Response, next: NextFunction) => {
        
        try {

            const resetPasswordObj:IResetPassword = req.body; 

            if(!resetPasswordObj.email || !resetPasswordObj.otp || !resetPasswordObj.password){
                throw new Error('email,otp,password can not be blank');
            }

            if(resetPasswordObj.email.length < 5 || resetPasswordObj.email.length > 50){
                throw new Error('Email must be between 5 and 50 characters');
            }

            if(resetPasswordObj.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/) === null){
                throw new Error('Please provide a valid email address');
            }

            // if(resetPasswordObj.otp.length !== 6){
            //     throw new Error('OTP is invalid');
            // }

            if(resetPasswordObj.password.length < 8){
                throw new Error('Password must be at least 8 characters');
            }

            if(resetPasswordObj.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/) === null){
                throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.');
            }

            const user: IUser | null = await this.userServices.findUserByEmail(resetPasswordObj.email);

            if(!user){
                throw new Error('User not found with this email/password');
            }

            if(user.userType === UserType.Admin){
                throw new Error('Admin can not perform reset password here');
            }

            console.log(user.forgotPassword.otp);
            console.log();
            
            if(!user.forgotPassword.otp){
                throw new Error('Invalid OTP not found');
            }

            if(parseInt(resetPasswordObj.otp)!== parseInt(user.forgotPassword.otp || '12345678')){
                throw new Error('Invalid OTP');
            }

        
            if(user.forgotPassword.otpGeneratedTime < new Date(Date.now() - 15 * 60 * 1000)){
                throw new Error('OTP has expired');
            }

            const updatesPasswordUserObj = await this.userServices.resetPassword(user,resetPasswordObj.password);

            res.status(200).json(new ApiResponse(200, 'Password reset successfully', updatesPasswordUserObj));

        }catch (error) {
            next(error);
        }
        
    }

    public update = async (req: Request<{}, {}, Partial<IUser>>, res: Response, next: NextFunction) => {
        upload.single('profilePicture')(req, res, async (err) => {
            if (err) {
                // Multer error handling
                return next(err);
            }
    
            try {

                
                const user = (req as any).user;

                const id  = user.id;
                const updates: Partial<IUser> = req.body;
    
                if (!id) {
                    throw new Error('User ID is required for updating user details.');
                }
    
                const existingUser = await this.userServices.findUserById(id);
    
                if (!existingUser) {
                    throw new Error('User not found.');
                }
    
                if (updates.email) {
                    const userWithMailExists = await this.userServices.findUserByEmail(updates.email);
    
                    if (userWithMailExists && userWithMailExists.id !== id) {
                        throw new Error('Another user with this email already exists.');
                    }
    
                    if (updates.email.length < 5 || updates.email.length > 50) {
                        throw new Error('Email must be between 5 and 50 characters.');
                    }
    
                    if (updates.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/) === null) {
                        throw new Error('Please provide a valid email address.');
                    }
                }
    
                if (updates.phone) {
                    const userWithPhoneExists = await this.userServices.findUserByPhone(updates.phone);
    
                    if (userWithPhoneExists && userWithPhoneExists.id !== id) {
                        throw new Error('Another user with this phone number already exists.');
                    }
    
                    if (updates.phone.match(/^\d{10}$/) === null) {
                        throw new Error('Please provide a valid phone number with 10 digits.');
                    }
                }
    
                if (updates.phoneCode && updates.phoneCode.match(/^\+\d{1,3}$/) === null) {
                    throw new Error('Please provide a valid country code, e.g., +1 for USA.');
                }
    
                if (updates.firstName) {
                    if (updates.firstName.length < 3 || updates.firstName.length > 50) {
                        throw new Error('First Name must be between 3 and 50 characters.');
                    }
                }
    
                if (updates.lastName) {
                    if (updates.lastName.length < 3 || updates.lastName.length > 50) {
                        throw new Error('Last Name must be between 3 and 50 characters.');
                    }
                }
    
                if (req.file) {
                    if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
                        throw new Error('Profile Picture must be in either JPEG or PNG format.');
                    }
    
                    const cloudinaryUrl = await uploadSingleFileToCloudinary(req.file.path, 'user_profiles');
                    updates.profilePicture = cloudinaryUrl;
                }
    
                const updatedUser = await this.userServices.updateUser(id, updates);
    
                res.status(200).json(new ApiResponse(200, 'profile updated successfully', updatedUser));
            } catch (error) {
                next(error);
            }
        });
    };

    public getUserById = async (req: Request<{ userId: string }, {}, {}>, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;

            if(!userId){
                throw new Error('User ID is required for fetching user details.');
            }

            if(userId.length < 24 || userId.length > 24){
                throw new Error('User ID must be 24 characters long.');
            }

        
            const user = await this.userServices.findUserById(userId);

            if(!user){
                throw new Error('User not found with this ID');
            }

            res.status(200).json(new ApiResponse(200, 'User details fetched successfully', user));
        } catch (error) {
            next(error);
        }
    };

    public getAllUsersWithPaginationSorting = async (req: Request<{}, {}, IGetAllUsersWithPaginationSorting>, res: Response, next: NextFunction) => {

        try {

            let reqBody: IGetAllUsersWithPaginationSorting = req.body;

            reqBody.page = reqBody.page || 1;
            reqBody.limit = reqBody.limit || 10;
            reqBody.sortField = reqBody.sortField || 'createdAt';
            reqBody.sortOrder = reqBody.sortOrder || 'DESC';

            const totalUser = await this.userServices.getTotalUsers();

            const paginationInfo = {
                page: reqBody.page,
                limit: reqBody.limit,
                sortField: reqBody.sortField,
                sortOrder: reqBody.sortOrder,
                totalPages: Math.ceil(totalUser / reqBody.limit),
                totalUsers: totalUser
            }

            const allUsers = await this.userServices.getAllUsersWithPaginationSorting(paginationInfo);

            if(!allUsers){
                throw new Error('No users found');
            }

            res.status(200).json(new ApiResponse(200, 'All users fetched successfully', {allUsers,paginationInfo}));
            
        } catch (error) {
            next(error);
        }
    }

    public searchUser = async (req: Request<{}, {}, ISearchBody>, res: Response, next: NextFunction) => {
        try {
            
            const searchBody: ISearchBody = req.body;

            if(!searchBody.search || !searchBody.searchField){
                throw new Error('search and searchField are required and can not be blank');
            }

            const allUsers = await this.userServices.searchUser(searchBody.searchField,searchBody.search);

            if(!allUsers){
                throw new Error('No users found');
            }

            res.status(200).json(new ApiResponse(200, 'All users fetched successfully', {allUsers,count:allUsers.length}));
        } catch (error) {
            next(error);
        }
    }

    public updateUserStatus = async (req: Request<{},{},{userId:string}>, res: Response, next: NextFunction) => {
        try {
            
            const {userId} = req.body;

            if(!userId){
                throw new Error('userId is required and can not be blank');
            }

            const userById = await this.userServices.findUserById(userId);

            if(!userById){
                throw new Error('User not found');
            }

            if(userById.userType === UserType.Admin){
                throw new Error('Admin can not be blocked');
            }

            let user;
            
            if(userById.authorization.isBlocked){
                user = await this.userServices.userStatusUpdate(userId,false,userById);
            }else{
                user = await this.userServices.userStatusUpdate(userId,true,userById);
            }
           
            if(!user){
                throw new Error('User not found');
            }

            res.status(200).json(new ApiResponse(200, 'User status updated successfully', {user}));
        } catch (error) {
            next(error);
        }
    }

    // Your login logic for Google authentication
    public loginWithGoogle1 = async (req: Request, res: Response, next: NextFunction) => {
    try {
    //   // Get email from Google profile (assuming it's in `req.user` after authentication)
    //   const email: string = req.user?.email;
  
    //   if (!email) {
    //     throw new Error('Email is required');
    //   }
  
    //   // Check if the user exists in your database by their email
    //   const user: IUser | null = await userServices.findUserByEmail(email);
  
    //   if (!user) {
    //     throw new Error('User not found with this email');
    //   }
  
    //   // Optionally, check user type (if needed)
    //   if (user.userType === UserType.Admin) {
    //     throw new Error('Admin cannot login here');
    //   }
  
    //   // Generate JWT token
    //   const ip = getClientIp(req); // Get IP address (optional)
    //   const token = jwt.sign(
    //     {
    //       id: user.id,
    //       email: user.email,
    //       userType: user.userType,
    //       ip,
    //     },
    //     process.env.JWT_SECRET || '',
    //     { expiresIn: '1h' } // Set token expiration
    //   );
  
    //   // Send response with the token and user info
    //   res.status(200).json({
    //     message: 'User logged in successfully',
    //     token,
    //     user,
    //   });
    } catch (error) {
      next(error);
    }
    };

    public googleAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auth = passport.authenticate('google', {
                scope: ['profile', 'email'],
            });

            console.log(auth);
            //res.status(200).json(new ApiResponse(200, 'User logged in successfully', auth));
        } catch (error) {
            next(error);
        }

    }

    public loginWithGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Google authentication failed' });
                return;
            }

            
            //const profile = req.profile as any;
    
            // `req.user` is set by Passport after successful authentication
            const googleUser = req.user as any;

            //console.log(googleUser);
            const user: IUser | null = await this.userServices.findUserById(googleUser?._id.toString());

            if(!user){
                throw new Error('User not found');
            }

            if(user.userType === UserType.Admin){
                throw new Error('Admin can not login here');
            }

            const ip = getClientIp(req);
            const token = await this.userServices.createJwtTokenIp(user,ip);
    
            if(!token){
                throw new Error('Token not found');
            }


            const redirectUrl = `${process.env.FRONTEND_URL}/GoogleAuth?token=${token}`;
            res.redirect(redirectUrl);

        } catch (error) {
            next(error); // Pass errors to Express error handler
        }
    };

    public loginWithMobile = async (req: Request<{},{},{phone:string,phoneCode:string}>, res: Response, next: NextFunction) => {
        try {
            
            const {phone,phoneCode} = req.body;

            if(!phone || !phoneCode){
                throw new Error('phone and phoneCode are required and can not be blank');
            }
            
            if(phone.length !== 10){
                throw new Error('phone must be 10 digits');
            }

            if(phoneCode.length !== 3){
                throw new Error('phoneCode must be 3 digits');
            }

            const user = await this.userServices.findUserByPhone(phone);

            if(!user){
                throw new Error('User not found');
            }   

            if(user.userType === UserType.Admin){
                throw new Error('Admin can not login here');
            }

            const otp = getOtp();
            const otpExpiryTime = getOtpExpiryTime();

            const userWithOtp = await this.userServices.generateOtp(user,otp,otpExpiryTime);
            
            if(!userWithOtp){
                throw new Error('Unable to generate otp');
            }

            
            
            
            
            
            

        } catch (error) {

            next(error);
        }
    }


    public verifyToken = async (req: Request<{},{},{token:string}>, res: Response, next: NextFunction) => {
        try {
            console.log(req.body);
            
            const {token} = req.body;

            if(!token){
                throw new Error('token is required and can not be blank');
            }

            const user =req.user as IUser;

            if(!user){
                throw new Error('User not found');
            }
            
            res.status(200).json(new ApiResponse(200, 'Token verified successfully', {user}));
            
        } catch (error) {
            next(error);
        }
    }


    

}


export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};