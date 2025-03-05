import { NextFunction, Request, Response } from "express";
import { ApiResponse } from '../Helper/apiResponse';
import { validateAdmin, validateCategory } from '../Helper/validationMethods';
import { Admin, IAdmin, Role } from '../Model/AdminModel';
import AdminService from '../Services/AdminServices';
import getClientIp from '../Helper/getIp';
import dotenv from "dotenv";
import CategoryServices from "../Services/CategoryServices";
import { ICategory,ISubCategory   } from "../Model/CategoryModel";
dotenv.config();



class CategoryController {

    private catagoryServices: CategoryServices;

    constructor() {
        this.catagoryServices = new CategoryServices();
    }

    postCategory = async (req: Request<{}, {}, ICategory>, res: Response, next: NextFunction) => {

        try {

            const { id, _id } = req.body;

            if (id || _id) {
                throw new Error("id or _id can not be passed in request body");
            }

            const categoryToAdd: ICategory = req.body;

            const categoryAlredyExist = await this.catagoryServices.getCategoryByName(categoryToAdd.name);

            if (categoryAlredyExist) {
                throw new Error("category with provided name already exists");
            }

            validateCategory(categoryToAdd, true);

            const addedCategory = await this.catagoryServices.createCategory(categoryToAdd);

            if (!addedCategory) {
                throw new Error("category could not be created");
            }

            res.status(201).json(new ApiResponse(201, "admin created successfully", {
                addedCategory,
                categoryId: addedCategory.id
            }))


        } catch (error) {
            next(error)
        }
    }

    postSubCategory = async (req: Request<{categoryId: string}, {}, ISubCategory>, res: Response, next: NextFunction) => {   
        try{
            const { categoryId } = req.params;
            const subCategoryToAdd: ISubCategory = req.body;


            if(!categoryId){
                throw new Error("categoryId is required");
            }

            if(!subCategoryToAdd.attributes){
                throw new Error("attributes is required");
            }

            if(!subCategoryToAdd.name){
                throw new Error("name is required");
            }
            

            // if(subCategoryToAdd?.id ||subCategoryToAdd?._id){

            //     throw new Error("id or _id can not be passed in request body");
            // }

            const category = await this.catagoryServices.getCategoryById(categoryId);

            if(!category){
                throw new Error("category not found");
            }

            const subCategories  = category.subCategories;

            
            subCategories.map((subCategory) => {
                if(subCategory.name.toLocaleLowerCase() === subCategoryToAdd.name.toLocaleLowerCase()){
                    throw new Error("category with provided name already exists");
                }
            })

            subCategories.push(subCategoryToAdd);

            const addedCategory = await this.catagoryServices.updateCategory(categoryId, category);

            if(!addedCategory){
                throw new Error("category could not be updated");
            }

            res.status(200).json(new ApiResponse(200, "category updated successfully", addedCategory))
            
            if(!subCategoryToAdd.name){
                throw new Error("name is required");
            }

            if(!subCategoryToAdd.attributes){
                throw new Error("attributes is required");
            }
            
        }catch(error){
            next(error)
        }
    }

    getCategories = async (req: Request, res: Response, next: NextFunction) => {

        try {  

            const categories = await this.catagoryServices.getCategories();

            if(!categories){
                throw new Error("categories not found");
            }

            console.log(categories);
            
            res.status(200).json(new ApiResponse(200, "categories fetched successfully", categories))

        }catch (error) {
            next(error)
        }
    }

    getOnlyCategory = async (req: Request<{}, {}, {}>, res: Response, next: NextFunction) => {
        try{
            const category = await this.catagoryServices.getCategories();

            if(!category){
                throw new Error("categories not found");
            }

            const categoryToReturn = category.map((category) => {
                return {
                    _id: category._id,
                    name: category.name,
                    description: category.description
                }
            })
            
            res.status(200).json(new ApiResponse(200, "only categories fetched successfully", categoryToReturn))

        }catch(error){
            next(error)
        }
    }

    getSubCategoriesByCategoryId = async (req: Request<{categoryId: string}, {}, {}>, res: Response, next: NextFunction) => {
        try{
            const {categoryId} = req.params;

            if(!categoryId){
                throw new Error("categoryId is required");
            }

            const category = await this.catagoryServices.getCategoryById(categoryId);

            if(!category){
                throw new Error("category not found");
            }

            res.status(200).json(new ApiResponse(200, "sub categories fetched successfully", {category,subCategories: category.subCategories}))
        }catch(error){
            next(error)
        }
    }

    getSubCategoryById = async (req: Request<{subCategoryId: string}, {}, {}>, res: Response, next: NextFunction) => {
        try{
            const {subCategoryId} = req.params;

            if(!subCategoryId){ 
                throw new Error("subCategoryId is required");  
            }  
            
            const subCategory = await this.catagoryServices.getSubCategoryById(subCategoryId);

            if(!subCategory){   
                throw new Error("subCategory not found");
            }

            res.status(200).json(new ApiResponse(200, "sub category fetched successfully", subCategory))
        }catch(error){
            next(error)
        }
    }

    putCategory = async (req: Request<{categoryId: string}, {}, ICategory>, res: Response, next: NextFunction) => {
        try{

            const { id, _id } = req.body;

            if (id || _id) {
                throw new Error("id or _id can not be passed in request body");
            }

            const {categoryId} = req.params;

            if(!categoryId){
                throw new Error("categoryId is required");
            }

            const category = await this.catagoryServices.getCategoryById(categoryId);

            if(!category){
                throw new Error("category not found");
            }

            const categoryToUpdate: ICategory = req.body;
            
            validateCategory(categoryToUpdate, true);

            const categoryAlredyExist = await this.catagoryServices.getCategoryByName(categoryToUpdate.name);

            // if (categoryAlredyExist) {
            //     throw new Error("category with provided name already exists");
            // }

            const updatedCategory = await this.catagoryServices.updateCategory(categoryId, categoryToUpdate);

            res.status(200).json(new ApiResponse(200, "category updated successfully", updatedCategory))    
        }
        catch(error){
            next(error)
        }
    }

    putSubCategory = async (req: Request<{subCategoryId: string}, {}, ISubCategory>, res: Response, next: NextFunction) => {
        try{

            if(!req.params.subCategoryId){
                throw new Error("subCategoryId is required");
            }

            const { subCategoryId } = req.params;
            const subCategoryToUpdate: ISubCategory = req.body;

            if(!subCategoryId){
                throw new Error("subCategoryId is required");
            }

            const category = await this.catagoryServices.getCategoryBySubCategoryId(subCategoryId);

            if(!category){
                throw new Error("category can not be found");
            }

            const subCategories  = category.subCategories;

            subCategories.map((subCategory: any) => {
                if(subCategory.name.toLocaleLowerCase() === subCategoryToUpdate.name.toLocaleLowerCase() && subCategory._id.toString() !== subCategoryId){
                    throw new Error("category with provided name already exists");
                }
            })

            let oldSub;
            subCategories.map((subCategory: any) => {
                if(subCategory._id.toString() === subCategoryId){
                    oldSub=subCategory;
                    subCategory.name = subCategoryToUpdate.name;
                    subCategory.attributes = subCategoryToUpdate.attributes;
                }
            })

            category.subCategories = subCategories;

            const updatedCategory = await this.catagoryServices.updateCategory(category.id, category);

            if(!updatedCategory){
                throw new Error("category can not be found");
            }
            
            res.status(200).json(new ApiResponse(200, "sub category updated successfully", {updatedCategory,oldSub,newSub: subCategoryToUpdate}))
            


        }catch(error){
            next(error)
        }
    }


    deleteSubCategory = async (req: Request<{subCategoryId: string}, {}, {}>, res: Response, next: NextFunction) => {
        try{

            if(!req.params.subCategoryId){
                throw new Error("subCategoryId is required");
            }

            const { subCategoryId } = req.params;
            

            if(!subCategoryId){
                throw new Error("subCategoryId is required");
            }

            const category = await this.catagoryServices.getCategoryBySubCategoryId(subCategoryId);

            if(!category){
                throw new Error("category can not be found");
            }

            const subCategories  = category.subCategories;

            let oldSub;
            
            subCategories.map((subCategory: any) => {
                if(subCategory._id.toString() === subCategoryId){
                    oldSub=subCategory;
                    subCategories.splice(subCategories.indexOf(subCategory), 1);
                }
            })

            category.subCategories = subCategories;

            const deletedCategory = await this.catagoryServices.updateCategory(category.id, category);

            if(!deletedCategory){
                throw new Error("category can not be found");
            }

            res.status(200).json(new ApiResponse(200, "sub category deleted successfully", {deletedCategory,oldSub}))
            


        }catch(error){
            next(error)
        }
    }


    deleteCategory = async (req: Request<{categoryId: string}, {}, {}>, res: Response, next: NextFunction) => {
        try{

            const { categoryId } = req.params;
            
            if(!categoryId){
                throw new Error("categoryId is required");
            }

            const category = await this.catagoryServices.getCategoryById(categoryId);

            if(!category){
                throw new Error("category can not be found");
            }

            if(category.subCategories.length > 0){
                throw new Error("category can not be deleted as it has subcategories");
            }

            const deletedCategory = await this.catagoryServices.deleteCategory(categoryId);

            if(!deletedCategory){
                throw new Error("category can not be deleted");
            }

            res.status(200).json(new ApiResponse(200, "category deleted successfully", deletedCategory));

        }catch(error){
            next(error)
        }
    }





}



export default CategoryController;