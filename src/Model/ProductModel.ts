import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './UserModel'; // Assuming User model is in a separate file
import { ICategory } from './CategoryModel'; // Assuming Category model is in a separate file
import { ILocation } from './LocationModel'; // Assuming Location model is in a separate file
import { currentUnixTimestampMs } from '../Helper/getIsoDate';
// Enum for product condition
enum ProductCondition {
  New = 'new',
  Used = 'used',
}

// Enum for product status
enum ProductStatus {
  Active = 'active',
  Sold = 'sold',
  Expired = 'expired',
  Blocked = 'blocked',
  Deleted = 'deleted',
}

// Interface for the Product document
interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  mainCategory: ICategory['_id']; // Reference to main category
  subCategory: string; // Reference to subcategory
  images: string[]; // Array of image URLs
  geoLocation?: {
    type: 'Point'; // GeoJSON type
    coordinates: [number, number]; // [longitude, latitude]
  };
  location: ILocation['_id']; // Reference to Location schema (location)
  condition: ProductCondition;
  seller: IUser['_id']; // Reference to User schema (seller)
  status: ProductStatus;
  publishedAt: Date;
  viewCount: number; // Number of times the product has been viewed
  likedBy: IUser['_id'][]; // Array of user IDs who liked the product
  dynamicFields: Map<string, any>; // Dynamic object
}

// Product schema
const productSchema: Schema<IProduct> = new Schema(
  {
    title: {
      type: String, 
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 100,
    },
    description: { 
      type: String, 
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },

    price: { 
       type: Number,
       required: true,
       min: 0,
       
      },
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories', // Reference to Category model (main category)
      required: true,
    }
    ,
    // subCategory: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'categories', // Reference to Category model (sub category)
    //   required: true,
    // }
    subCategory: {
      type: String, // Store subCategory as a simple string (name or ID)
      required: true,
      trim: true,
    }
    ,
    images: [{ type: String }], // Array of image URLs
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'], // GeoJSON type must be 'Point'
      },
      coordinates: {
        type: [Number], // Array of [longitude, latitude]
      },
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location', // Reference to Location model (location)
      required: true,
    },
    condition: {
      type: String,
      enum: Object.values(ProductCondition),
      //default: ProductCondition.Used,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model (seller)
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.Active,
    },
    viewCount: {
      type: Number,
      default: 0, 
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
      },
    ],
    publishedAt: { type: Date, default: currentUnixTimestampMs() },
    dynamicFields: {
      type: Map,
      of: Schema.Types.Mixed, // Allow arbitrary key-value pairs
      default: {},
    },

  },
  { timestamps: true }
);

// Add a 2dsphere index for the geoLocation field to enable geospatial queries
productSchema.index({ geoLocation: '2dsphere' });

// Create and export the Product model
const Product = mongoose.model<IProduct>('Product', productSchema);

export { Product, IProduct, ProductCondition, ProductStatus };
