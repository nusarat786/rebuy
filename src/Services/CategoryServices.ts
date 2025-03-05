import Category, { ISubCategory } from "../Model/CategoryModel";
import { ICategory } from "../Model/CategoryModel";

class CategoryServices {
    async createCategory(category: ICategory) {
        const newCategory = new Category(category);
        return await newCategory.save();
    }

    async getCategories() {
        return await Category.find({}).lean().exec();
    }

    async getCategoryById(id: string) {
        return await Category.findById(id).exec();
    }

    async updateCategory(id: string, updateData: Partial<ICategory>) {
        return await Category.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }


    async updateSubCategory(id: string, updateData: Partial<ICategory>, subCategory: ISubCategory) {
        //updateData.subCategories.=subCategory.attributes;
    }



    async deleteCategory(id: string) {
        return await Category.findByIdAndDelete(id).exec();
    }

    async getCategoryByName(name: string) {
        return await Category.findOne({ name }).exec();
    }

    // Method to get a subcategory by its _id
    async getSubCategoryById(subCategoryId: string) {

        // Find category containing the subcategory with the given _id
        const category: ICategory | null = await Category.findOne(
            { "subCategories._id": subCategoryId },  // Search for subcategory by _id
            { "subCategories.$": 1 } // Return only the matched subcategory
        );

        if (!category) {
            console.log("Subcategory not found");
            return null;
        }

        // Return the matched subcategory
        return category.subCategories[0]; // Get the first matched subcategory

    }

    public async getCategoryBySubCategoryId(subCategoryId: string) {
        try {
            // Find category containing the subcategory with the given _id
            const category: ICategory | null = await Category.findOne(
                { "subCategories._id": subCategoryId },  // Search for subcategory by _id
            );

            if (!category) {
                console.log("Subcategory not found");
                return null;
            }

            // Return the matched subcategory
            return category; // Get the first matched subcategory
        } catch (error) {
            console.error("Error fetching subcategory:", error);
            throw new Error("Error fetching subcategory");
        }
    }
}


export default CategoryServices;