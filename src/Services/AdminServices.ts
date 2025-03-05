import { Admin, IAdmin } from '../Model/AdminModel'; // import the Admin model
import bcrypt from "bcryptjs";

class AdminService {

    // Create a new admin
    async createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin> {
        const admin = new Admin(adminData);
        return await admin.save();
    }

    // Retrieve an admin by ID
    async getAdminById(id: string): Promise<IAdmin | null> {
        return await Admin.findById(id).exec();
    }

    // Retrieve all admins
    async getAllAdmins(): Promise<IAdmin[]> {
        return await Admin.find({}).exec();
    }

    // Update an admin by ID
    // async updateAdmin(id: string, updateData: Partial<IAdmin>): Promise<IAdmin | null> {
    //     return await Admin.findByIdAndUpdate(id, updateData, { new: true }).exec();
    // }
    async updateAdmin(id: string, updateData: Partial<IAdmin>): Promise<IAdmin | null> {
        // Check if password is in the update data and needs hashing
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
    
        // Update the admin and return the updated document
        return await Admin.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    // Delete an admin by ID
    async deleteAdmin(id: string): Promise<IAdmin | null> {
        return await Admin.findByIdAndDelete(id).exec();
    }

    // Get paginated admins
    async getPaginatedAdmins(startIndex: number, limit: number): Promise<IAdmin[]> {
        return await Admin.find({})
            .skip(startIndex)
            .limit(limit)
            .exec();
    }

    // Get paginated and sorted admins
    async getPaginatedAndSortedAdmins(
        startIndex: number,
        limit: number,
        sortField: keyof IAdmin = 'adminName',
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<IAdmin[]> {
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        return await Admin.find({})
            .sort({ [sortField]: sortDirection })
            .skip(startIndex)
            .limit(limit)
            .exec();
    }

    // Get admins by role (ADMIN or SUPERADMIN)
    async getAdminsByRole(role: 'ADMIN' | 'SUPERADMIN'): Promise<IAdmin[]> {
        return await Admin.find({ role }).exec();
    }

    // Get the total number of admins
    async getTotalAdmins(): Promise<number> {
        return await Admin.countDocuments().exec();
    }

    // Authenticate admin login (comparing passwords)
    async authenticateAdmin(admin: IAdmin, candidatePassword: string): Promise<IAdmin | null> {

        if (admin && await admin.comparePassword(candidatePassword)) {
            return admin;
        }
        return null;
    }

    async getAdminByEmail(email: string): Promise<IAdmin | null> {
        return await Admin.findOne({ adminEmail: email }).exec();
    }

    

}

export default AdminService;
