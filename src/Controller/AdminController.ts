import express, { NextFunction, Request, Response } from 'express';

import { ApiResponse } from '../Helper/apiResponse';
import { validateAdmin } from '../Helper/validationMethods';
import { Admin, IAdmin, Role } from '../Model/AdminModel';
import AdminService from '../Services/AdminServices';
import getClientIp from '../Helper/getIp';
import dotenv from "dotenv";
import UserService from '../Services/UserServices';
dotenv.config();





interface GetAdminQuery {
    page?: string;
    limit?: string;
    sortOrder?: 'asc' | 'desc';
    includeactualTime?: string;
    sortField?: string; 

}

interface IAdminLogin {
    adminEmail: string;
    password: string
}
export class AdminController {

    private adminServices: AdminService;

    private userServices: UserService;
    constructor() {
        this.adminServices = new AdminService();
        this.userServices = new UserService();
    }


    adminLogin = async (req: Request<{}, {}, IAdminLogin>, res: Response, next: NextFunction) => {
        try {

            const adminloginCredentials: IAdminLogin = req.body;

            validateAdmin(adminloginCredentials, false);

            const admin = await this.adminServices.getAdminByEmail(adminloginCredentials.adminEmail);

            //await this.adminServices.authenticateAdmin(adminloginCredentials.adminEmail, adminloginCredentials.password);

            if (!admin) {
                throw new Error("Invalid credentials");
            }

            const isAuthenticated = await admin.comparePassword(adminloginCredentials.password);

            if (!isAuthenticated) {
                throw new Error("Invalid credentials Fail");
            }

            const ip = getClientIp(req);
            const token = admin.createJWT(ip);

            if (!token) {
                throw new Error("token could not be created");
            }

            res.status(200).json(new ApiResponse(200, "Login successful", {
                admin,
                token,
                isAuthenticated
            }
            ))

        } catch (error) {
            next(error)
        }
    }

    postAdmin = async (req: Request<{}, {}, IAdmin>, res: Response, next: NextFunction) => {
        try {

            const { id, _id } = req.body;

            if (id || _id) {
                throw new Error("id or _id can not be passed in request body");
            }

            const admin = (req as any).admin;

            if (!admin) {
                throw new Error("admin can not be authenticated");
            }

            //console.log(admin)
            if (admin.role !== Role.SUPERADMIN) {
                throw new Error("only superadmin can add another admin");
            }

            const adminToAdd: IAdmin = req.body;

            const adminAlredyExist = await this.adminServices.getAdminByEmail(adminToAdd.adminEmail);

            if (adminAlredyExist) {
                throw new Error("admin with provided email already exists");
            }

            validateAdmin(adminToAdd, true);

            const addedAdmin = await this.adminServices.createAdmin(adminToAdd);

            if (!addedAdmin) {
                throw new Error("admin could not be created");
            }

            res.status(201).json(new ApiResponse(201, "admin created successfully", {
                addedAdmin,
                loginLogid: addedAdmin.id
            }))


        } catch (error) {
            next(error)
        }
    }

    postDefaultAdmin = async (req: Request<{}, {}, {}>, res: Response, next: NextFunction) => {
        try {


            const defaultadmin = {
                adminEmail: process.env.ADMIN_EMAIL as string,
                password: process.env.ADMIN_PASSWORD as string,
                role: process.env.ADMIN_ROLE as Role,
                adminName: process.env.ADMIN_NAME as string
            }
            //console.log(defaultadmin)


            const adminAlredyExist = await this.adminServices.getAdminByEmail(defaultadmin.adminEmail);

            if (adminAlredyExist) {
                res.status(201).json(new ApiResponse(201, "default admin alredy exist with same email", {
                    adminAlredyExist,
                    loginLogid: adminAlredyExist.id
                }))
                return;
            }

            validateAdmin(defaultadmin, true);

            const addedAdmin = await this.adminServices.createAdmin(defaultadmin);

            if (!addedAdmin) {
                throw new Error("default admin could not be created");
            }



            res.status(201).json(new ApiResponse(201, "default admin created successfully", {
                addedAdmin,
                loginLogid: addedAdmin.id
            }))

        } catch (error) {
            next(error)
        }
    }

    putAdmin = async (req: Request<{ adminId: string }, {}, IAdmin>, res: Response, next: NextFunction) => {

        try {

            const id = req.params.adminId || null;

            if (!id) {
                throw new Error("adminId is required and can not be blank");
            }

            const admin = (req as any).admin;
            

            if (!admin) {
                throw new Error("admin can not be authenticated");
            }

            if (admin.role !== Role.SUPERADMIN) {
                throw new Error("only superadmin can add another admin");
            }

            const adminToUpdate: IAdmin = req.body;

            if (adminToUpdate.id || adminToUpdate._id) {
                throw new Error("id or _id can not be passed in request body");
            }

            validateAdmin(adminToUpdate, true);

            const isAdminExist = await this.adminServices.getAdminById(id);

            if (!isAdminExist) {
                throw new Error("admin does not exist");
            }

            const updatedAdmin = await this.adminServices.updateAdmin(id, adminToUpdate);

            if (!updatedAdmin) {
                throw new Error("admin could not be updated");
            }

            res.status(200).json(new ApiResponse(200, "user login logadmin updated successfully", { updatedAdmin }))

        } catch (error) {
            next(error);
        }
    }

    getAdmins = async (req: Request<{}, {}, {}, GetAdminQuery>, res: Response, next: NextFunction) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";
    
            const validSortFields: Array<keyof IAdmin> = [ "adminName", "adminEmail", "role"];
            const sortField = validSortFields.includes(req.query.sortField as keyof IAdmin)
                ? (req.query.sortField as keyof IAdmin)
                : "adminName";
    
            if(req.query.sortField && !(validSortFields.includes(req.query.sortField as keyof IAdmin))){
                throw new Error(`sortField can only be from ${validSortFields} `)
            }

            if (limit < 1) {
                throw new Error(`Limit cannot be less than 1`);
            }
    
            if (page < 1) {
                throw new Error(`Page cannot be less than 1`);
            }
    
            const totalAdmins = await this.adminServices.getTotalAdmins();
            if (totalAdmins < 1) {
                throw new Error(`No admins found`);
            }
    
            const paginationInfo = {
                currentPage: page,
                totalPages: Math.ceil(totalAdmins / limit),
                totalAdmins: totalAdmins,
                limit: limit,
                sortOrder: sortOrder,
                validSortFields,
                sortField
            };
    
            if (page > paginationInfo.totalPages) {
                throw new Error(`Page does not exist: requested page (${page}) > total pages (${paginationInfo.totalPages})`);
            }
    
            const startIndex = (page - 1) * limit;
            const admins = await this.adminServices.getPaginatedAndSortedAdmins(startIndex, limit, sortField, sortOrder);
    
            res.status(200).json(new ApiResponse(200, "Admins fetched successfully", { admins, paginationInfo }));
        } catch (error) {
            next(error);
        }
    };
    

    // getAdmins = async (req: Request<{}, {}, {}, GetAdminQuery>, res: Response, next: NextFunction) => {
    //     try {
    //         const page = req.query.page ? parseInt(req.query.page) : 1;
    //         const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    //         const startIndex = (page - 1) * limit;
    //         const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";
    //         const totalAdmins = await this.adminServices.getTotalAdmins();

    //         if (limit < 1) {
    //             throw new Error(`Limit cannot be less than 1`);
    //         }

    //         if (page < 1) {
    //             throw new Error(`Page cannot be less than 1`);
    //         }

    //         if (sortOrder !== "asc" && sortOrder !== "desc") {
    //             throw new Error(`Sort order can only be 'asc' or 'desc'`);
    //         }

    //         if (totalAdmins < 1) {
    //             throw new Error(`No admins found`);
    //         }

    //         const paginationInfo = {
    //             currentPage: page,
    //             totalPages: Math.ceil(totalAdmins / limit),
    //             totalAdmins: totalAdmins,
    //             limit: limit,
    //             sortOrder: sortOrder,
    //         };

    //         if (page > paginationInfo.totalPages) {
    //             throw new Error(`Page does not exist: requested page (${page}) > total pages (${paginationInfo.totalPages})`);
    //         }

    //         const admins = await this.adminServices.getPaginatedAndSortedAdmins(startIndex, limit, "adminName", sortOrder);

    //         res.status(200).json(new ApiResponse(200, "Admins fetched successfully", { admins, paginationInfo }));
    //     } catch (error) {
    //         next(error);
    //     }
    // };


    getAdminById = async (req: Request<{ adminId: string }, {}, {}>, res: Response, next: NextFunction) => {
        try {
            const id = req.params.adminId || null;

            if (!id) {
                throw new Error("Admin ID is required and cannot be blank");
            }

            const isAdminExist = await this.adminServices.getAdminById(id);

            if (!isAdminExist) {
                throw new Error("Admin does not exist with the provided ID");
            }

            res.status(200).json(new ApiResponse(200, "Admin fetched successfully", { admin: isAdminExist }));
        } catch (error) {
            next(error);
        }
    };

    deleteAdmin = async (req: Request<{ adminId: string }, {}, {}>, res: Response, next: NextFunction) => {
        try {
            const id = req.params.adminId || null;

            if (!id) {
                throw new Error("Admin ID is required and cannot be blank");
            }

            const isAdminExist = await this.adminServices.getAdminById(id);

            if (!isAdminExist) {
                throw new Error("Admin does not exist with the provided ID");
            }

            const deletedAdmin = await this.adminServices.deleteAdmin(id);

            if (!deletedAdmin) {
                throw new Error("Admin could not be deleted");
            }

            res.status(200).json(new ApiResponse(200, "Admin deleted successfully", { deletedAdmin }));
        } catch (error) {
            next(error);
        }
    };

    




}











