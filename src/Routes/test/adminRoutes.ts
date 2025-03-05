import { Router } from 'express';
import { AdminController } from '../../Controller/AdminController';
import authMiddleware from '../../Middleware/authMiddleware';
import { UserController } from '../../Controller/UserController';
const router = Router();

const adminController :AdminController = new AdminController();
const userController :UserController = new UserController();



router.post('/admin/postAdmin',authMiddleware ,adminController.postAdmin.bind(adminController));

router.post('/admin/postDefaultAdmin' ,adminController.postDefaultAdmin.bind(adminController));

router.post("/admin/adminLogin",adminController.adminLogin.bind(adminController));

router.put('/admin/putAdmin/:adminId',authMiddleware ,adminController.putAdmin.bind(adminController));

router.get('/admin/getAdmin',authMiddleware,adminController.getAdmins.bind(adminController))

router.get('/admin/getAdminById/:adminId',authMiddleware,adminController.getAdminById.bind(adminController))

router.delete('/admin/deleteAdminbyId/:adminId',authMiddleware,adminController.deleteAdmin.bind(adminController))

router.get('/admin/getUserById/:userId',authMiddleware,userController.getUserById.bind(userController))

router.post('/admin/getAllUsersWithPaginationSorting',authMiddleware,userController.getAllUsersWithPaginationSorting.bind(userController))

router.post('/admin/searchUser',authMiddleware,userController.searchUser.bind(userController))

router.post('/admin/updateUserStatus',authMiddleware,userController.updateUserStatus.bind(userController))

export default router;