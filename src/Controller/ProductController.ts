import express, { NextFunction, Request, Response } from 'express';

import { ApiResponse } from '../Helper/apiResponse';
import getClientIp from '../Helper/getIp';
import dotenv from "dotenv";
import ProductService from '../Services/ProductServices';
import LocationService from '../Services/LocationServices';
import UserService from '../Services/UserServices';
import { IProduct, ProductStatus } from '../Model/ProductModel';
import { ILocation } from '../Model/LocationModel';
import { IUser } from '../Model/UserModel';
import upload from '../Helper/multer';
import { uploadMultipleFilesToCloudinary, uploadMultipleFilesToCloudinaryV2 } from '../Helper/cloudry';
import fs from 'fs';
import path from 'path';
import { uploadPath } from '../Helper/multer';
import { currentUnixTimestampMs } from '../Helper/getIsoDate';

dotenv.config();


class ProductController {

    private productService: ProductService;
    private locationService: LocationService;
    private userService: UserService;

    constructor() {
        this.productService = new ProductService();
        this.locationService = new LocationService();
        this.userService = new UserService();
    }

    public async createProduct2(req: Request<{},{},IProduct>, res: Response, next: NextFunction) {
        try {

            const productData: IProduct = req.body;
            //this.validateProductData(productData);

            if(!req.files){
                throw new ApiResponse(400,"Images are required",null);
            }

            if(req.files){
                const files = req.files as Express.Multer.File[];

                if(files.length > 8){
                    throw new ApiResponse(400,"You can only upload 8 images",null);
                }

                if(files.length === 0){
                    throw new ApiResponse(400,"At least one image is required",null);
                }

                const imagePaths = await uploadMultipleFilesToCloudinary(files.map((file)=>file.path), "products");

                productData.images = imagePaths;
            }

            res.status(200).json(new ApiResponse(200,"Product data is valid",{productData}));

            // const product = await this.productService.createProduct(productData);
            // res.status(201).json(new ApiResponse(201,"Product created successfully",product));
        }catch(error){
            next(error);
        }
    }

    createProduct = async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const productData: IProduct = req.body;
      
          if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return next(new ApiResponse(400, "Images are required", null));
          }
      
          const files = req.files as Express.Multer.File[];
      
          if (files.length > 8) {
            return next(new ApiResponse(400, "You can only upload 8 images", null));
          }
      
          const imagePaths = await uploadMultipleFilesToCloudinary(
            files.map((file) => file.path),
            "products"
          );
      
          productData.images = imagePaths;

        files.forEach((file) => {
            const filePath = path.join(uploadPath, file.filename);
            fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${filePath}`, err);
            } else {
                console.log(`Successfully deleted file: ${filePath}`);
            }
            });
        });
      
          res.status(201).json(new ApiResponse(201, "Product created successfully", productData));
        } catch (error) {
          next(error);
        }
    };

    createProductV2 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          const user = req.user;
          let userData: IUser | null = null;
          if(!user){
            return next(new ApiResponse(401, "Unauthorized", null));
          }

        
          const productData: IProduct = req.body;
          if (user && 'id' in user) {
            productData.seller = user.id;

            userData = await this.userService.findUserById(user.id as string);

            if(!userData){
              return next(new ApiResponse(401, "Unauthorized", null));
            }

            const productCount = await this.productService.getProductCountInLast90Days(user.id as string);
            
            console.log(productCount);

            if(productCount >= 10 && !(userData.premium.premiumExpiryTime && userData.premium.premiumExpiryTime.getTime() < currentUnixTimestampMs())){
                throw new ApiResponse(401, "You have reached the maximum limit of products", null);
            }

          }else{
            return next(new ApiResponse(401, "Unauthorized", null));
          }


          this.validateProductData(productData);
      
          if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return next(new ApiResponse(400, "Images are required", null));
          }
      
          const files = req.files as Express.Multer.File[];
      
          if (files.length > 8) {
            return next(new ApiResponse(400, "You can only upload 8 images", null));
          }
      
          const imagePaths = await uploadMultipleFilesToCloudinaryV2(
            files.map((file) => file.buffer),  // Use `file.buffer` for direct upload from the request body
            "products"
          );

          if(imagePaths.length === 0){
            return next(new ApiResponse(400, "Images are required", null));
          }
          
          productData.images = imagePaths;


          const location = await this.locationService.getLocationBy_Id(productData.location as string);


          if(!location){
            return next(new ApiResponse(400, "Location is required", null));
          }

          productData.geoLocation = {
            type: "Point",
            coordinates: [location.longitude, location.latitude]
          }

          
          const product = await this.productService.createProduct(productData);

          if(!product){
            return next(new ApiResponse(400, "Product creation failed", null));
          }

        
          res.status(201).json(new ApiResponse(201, "Product created successfully", {product}));


        } catch (error) {
            console.log(error);
          next(error);
        }
    };

    editProduct = async (req: Request<{id:string},{},IProduct>, res: Response, next: NextFunction): Promise<void> => {
        try {
            
            const productId = req.params.id;
            const productDataFromBody: IProduct = req.body;

            console.log(productDataFromBody);

            const productToUpadte: IProduct | null = await this.productService.findProductById(productId);

            if(!productToUpadte){
                return next(new ApiResponse(404, "Product not found", null));
            }

            if(productToUpadte && ((productToUpadte.seller as any)._id as any).toString() !== (req.user as IUser & { id: string })?.id){
                //console.log();
                console.log((req.user as IUser & { id: string })?.id);
                return next(new ApiResponse(401, "Unauthorized", null));
            }

            if(req.files && Array.isArray(req.files) && req.files.length > 0){
                const files = req.files as Express.Multer.File[];

                if(files.length > 8){
                    return next(new ApiResponse(400, "You can only upload 8 images", null));
                }
                const imagePaths = await uploadMultipleFilesToCloudinaryV2(
                    files.map((file) => file.buffer),  // Use `file.buffer` for direct upload from the request body
                    "products"
                  );

                productToUpadte.images = imagePaths;
                console.log("image updated");
            }

            if(productDataFromBody.title){
                productToUpadte.title = productDataFromBody.title;
            }

            if(productDataFromBody.description){
                productToUpadte.description = productDataFromBody.description;
            }

            if(productDataFromBody.price){
                productToUpadte.price = productDataFromBody.price;
            }

            if(productDataFromBody.mainCategory){
                productToUpadte.mainCategory = productDataFromBody.mainCategory;
            }

            if(productDataFromBody.subCategory){
                productToUpadte.subCategory = productDataFromBody.subCategory;
            }

            if(productDataFromBody.location){
                productToUpadte.location = productDataFromBody.location;
            }

            if(productDataFromBody.condition){
                productToUpadte.condition = productDataFromBody.condition;
            }

            if(productDataFromBody.status){
                productToUpadte.status = productDataFromBody.status;
            }

            if(productDataFromBody.location){
                const location = await this.locationService.getLocationBy_Id(productDataFromBody.location as string);
                if(!location){
                    return next(new ApiResponse(400, "Location is invalid", null));
                }
                productToUpadte.geoLocation = {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude]
                }
            }

            if(productDataFromBody.dynamicFields){
                productToUpadte.dynamicFields = productDataFromBody.dynamicFields;
            }

            if(productDataFromBody.publishedAt){
                productToUpadte.publishedAt = productDataFromBody.publishedAt;
            }

            const updatedProduct = await this.productService.updateProduct(productId, productToUpadte);

            res.status(200).json(new ApiResponse(200, "Product updated successfully", {updatedProduct}));

        } catch (error) {
            next(error);
        }
    }

    deleteProduct = async (req: Request<{id:string}>, res: Response, next: NextFunction): Promise<void> => {
        try {

            const user = req.user;

            if(!user){
                return next(new ApiResponse(401, "Unauthorized", null));
            }

            const productId = req.params.id;

            const product = await this.productService.findProductById(productId);

            if(!product){
                return next(new ApiResponse(404, "Product not found", null));
            }

            if(product && ((product.seller as any)._id as any).toString() !== (req.user as IUser & { id: string })?.id){
                return next(new ApiResponse(401, "Unauthorized", null));
            }  

            if(product.status === ProductStatus.Sold){
                return next(new ApiResponse(400, "Product is sold and cannot be deleted", null));
            }

            if(product.status === ProductStatus.Deleted){
                return next(new ApiResponse(400, "Product is already deleted", null));
            }

            if(product.status === ProductStatus.Expired){
                return next(new ApiResponse(400, "Product is expired and cannot be deleted", null));
            }

            if(product.status === ProductStatus.Blocked){
                return next(new ApiResponse(400, "Product is blocked and cannot be deleted", null));
            }

            product.status = ProductStatus.Deleted;

            const deletedProduct = await this.productService.updateProduct(productId, product);


            res.status(200).json(new ApiResponse(200, "Product deleted successfully", {deletedProduct}));

        } catch (error) {
            next(error);
        }
    }

    getProductById = async (req: Request<{},{}, {id:string}>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const productId = req.body.id;

            const product = await this.productService.findProductById(productId);

            res.status(200).json(new ApiResponse(200, "Product fetched successfully", {product}));


        } catch (error) {
            
        }
    }
      
    public validateProductData(productData: IProduct): void {
        
        if(!productData.title){
            throw new ApiResponse(400,"Title is required",null);
        }
        if(!productData.description){
            throw new ApiResponse(400,"Description is required",null);
        }
        
        if(!productData.price){
            throw new ApiResponse(400,"Price is required",null);
        }
        
        if(!productData.mainCategory){
            throw new ApiResponse(400,"Main category is required",null);
        }
        if(!productData.subCategory){
            throw new ApiResponse(400,"Sub category is required",null);
        }
        
        if(!productData.location){
            throw new ApiResponse(400,"Location is required",null);
        }
        if(!productData.condition){
            throw new ApiResponse(400,"Condition is required",null);
        }

        if(!productData.seller){
            throw new ApiResponse(400,"Seller is required",null);
        }

        // if(!productData.status){
        //     throw new ApiResponse(400,"Status is required",null);
        // }

        
    }
    
    
    

}



export default ProductController;


