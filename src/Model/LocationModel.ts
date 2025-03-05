import { Schema, model, Document } from "mongoose";

// Define an interface for the Location document
interface ILocation extends Document {
  id: number; // This will serve as the primary key
  name: string;
  type: "CITY" | "NEIGHBOURHOOD" | "STATE" | "COUNTRY";
  longitude: number;
  latitude: number;
  parentId?: number; // Reference to the `id` of another Location object
}

// Create the Location schema
const LocationSchema = new Schema<ILocation>(
  {
    //_id: true, // Disable automatic MongoDB `_id` generation
    id: { type: Number, required: true, unique: true }, // Use `id` as the primary key
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ["CITY", "NEIGHBOURHOOD", "STATE", "COUNTRY"] },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    parentId: { type: Number, ref: "Location" }, // Reference another Location's `id`
  },
  { timestamps: true }
);

// Create the Location model
const Location = model<ILocation>("Location", LocationSchema);

export {Location , ILocation};
