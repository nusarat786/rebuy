import { Router } from 'express';
import { AdminController } from '../../Controller/AdminController';
import authMiddleware from '../../Middleware/authMiddleware';
import CategoryController from '../../Controller/CategoryController';
const router = Router();


const canategoryController:CategoryController=new CategoryController();

router.post('/admin/category/postCategory',authMiddleware ,canategoryController.postCategory.bind(canategoryController));

router.post('/admin/category/postSubCategory/:categoryId',authMiddleware ,canategoryController.postSubCategory.bind(canategoryController));

router.get('/admin/category/getCategories',canategoryController.getCategories.bind(canategoryController))

router.get('/admin/category/getOnlyCategories/',canategoryController.getOnlyCategory.bind(canategoryController))

router.get('/admin/category/getSubCategories/:categoryId',canategoryController.getSubCategoriesByCategoryId.bind(canategoryController))

router.get('/admin/category/getSubCategoryById/:subCategoryId',canategoryController.getSubCategoryById.bind(canategoryController)    )

router.put('/admin/category/putCategory/:categoryId',authMiddleware ,canategoryController.putCategory.bind(canategoryController))

router.put('/admin/category/putSubCategory/:subCategoryId',authMiddleware ,canategoryController.putSubCategory.bind(canategoryController))

router.delete('/admin/category/deleteSubCategory/:subCategoryId',authMiddleware ,canategoryController.deleteSubCategory.bind(canategoryController))

router.delete('/admin/category/deleteCategory/:categoryId',authMiddleware ,canategoryController.deleteCategory.bind(canategoryController))
export default router;