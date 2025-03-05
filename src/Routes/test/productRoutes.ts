import { Router } from 'express';
import  ProductController  from '../../Controller/ProductController';
import authMiddleware from '../../Middleware/authMiddleware';
import upload from '../../Helper/multer';
import uploadV2 from '../../Helper/multerV2';
const router = Router();


const productController :ProductController = new ProductController();

router.post("/user/product/createProduct",authMiddleware,upload.array("images", 8),productController.createProduct.bind(productController));

router.post("/user/product/createProductV2",authMiddleware,uploadV2.array("images", 8),productController.createProductV2.bind(productController));

router.post("/user/product/getProductById",authMiddleware,productController.getProductById.bind(productController));

router.post("/user/product/updateProduct/:id",authMiddleware,uploadV2.array("images", 8),productController.editProduct.bind(productController));

router.delete("/user/product/deleteProduct/:id",authMiddleware,productController.deleteProduct.bind(productController));

export default router;