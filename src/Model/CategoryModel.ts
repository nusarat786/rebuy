import mongoose, { Schema, Document, Model } from 'mongoose';

interface IAttribute {
    name: string; // Attribute name (e.g., Brand, RAM)
    required: boolean; // Indicates if the attribute is mandatory
    type: string; // Type of the attribute (e.g., string, number)
}

export interface ISubCategory {
    name: string; 
    attributes: IAttribute[]; 
}

export interface ICategory extends Document {
    name: string; 
    description?: string; 
    subCategories: ISubCategory[]; 
    createdAt: Date; 
}

const categorySchema: Schema<ICategory> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique:true 
    }, 

    description: {
        type: String,
        required: true,
        default: "",
        trim: true,
    }, 

    subCategories: {
        type: [
            {
                name: { type: String, required: true }, 
                attributes: {
                    type: [
                        {
                            name: { type: String }, // Attribute name
                            required: { type: Boolean }, // Is attribute required
                            type: { type: String }, // Type of attribute
                        },
                    ],
                    required: true, 
                    default: [], 
                },
            },
        ],
        default: [], 
    },
    
    

    createdAt: { type: Date, default: Date.now },
});

// Exporting the Mongoose Model
const Category: Model<ICategory> = mongoose.model<ICategory>('categories', categorySchema);

export default Category;
