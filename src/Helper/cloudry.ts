
import dotenv from 'dotenv';
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';
//import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
dotenv.config();

// Cloudinary configuration
const cloudinaryConfig: ConfigOptions = {
  cloud_name: process.env.CL_CLOUD_NAME || '',
  api_key: process.env.CL_API_KEY || '',
  api_secret: process.env.CL_SECRET || '',
};

cloudinary.config(cloudinaryConfig);

// Extend the Params type to include custom properties
interface CustomParams {
  folder: string;
  format?: (req: Request, file: Express.Multer.File) => Promise<string> | string;
  public_id?: (req: Request, file: Express.Multer.File) => string;
}

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-images', // Folder in Cloudinary
    format: async (req: Request, file: Express.Multer.File) => {
      const mimeTypes: { [key: string]: string } = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      return mimeTypes[file.mimetype] || 'jpg';
    },
    public_id: (req: Request, file: Express.Multer.File) => {
      const name = file.originalname.replace(/\.[^/.]+$/, '');
      return name;
    },
  } as CustomParams, // Type assertion to include custom properties
});

/**
 * Upload a single file to Cloudinary
 * @param localPath - Path to the local file
 * @param folder - Folder name in Cloudinary
 * @returns Secure URL of the uploaded file
 */
const uploadSingleFileToCloudinary = async (localPath: string, folder: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: folder,
    use_filename: false,
    unique_filename: true,
    public_id: `${uuidv4()}-${path.basename(localPath, path.extname(localPath))}`, // Unique public ID
  });

  return result.secure_url;
};

/**
 * Upload multiple files to Cloudinary
 * @param localPaths - Array of local file paths
 * @param folder - Folder name in Cloudinary
 * @returns Array of secure URLs for the uploaded files
 */
const uploadMultipleFilesToCloudinary = async (localPaths: string[], folder: string): Promise<string[]> => {
  const uploadPromises = localPaths.map((localPath) => uploadSingleFileToCloudinary(localPath, folder));
  return Promise.all(uploadPromises);
};



/**
 * Delete a file from Cloudinary
 * @param fileUrl - Public URL of the file to delete
 */
const deleteFileFromCloudinary = async (fileUrl: string): Promise<void> => {
    // Extract the public_id from the URL
    const url = new URL(fileUrl);
    const filePath = url.pathname; // Example: /<cloud_name>/image/upload/v1672501234/<folder>/<public_id>.jpg
  
    // Remove the prefix and suffix to get the public_id
    const publicId = filePath
      .replace(/^\/[^/]+\/[^/]+\/[^/]+\//, '') // Remove /<cloud_name>/image/upload/ and version
      .replace(/\.[^/.]+$/, ''); // Remove the file extension
  
    // Delete the file from Cloudinary
    await cloudinary.uploader.destroy(publicId);
  };
  
  const uploadMultipleFilesToCloudinaryV2 = async (files: Buffer[], folder: string): Promise<string[]> => {
    try {
      // Create an array of promises to handle uploading all files
      const uploadPromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (error:any, result:any) => {
              if (error) {

                reject(error);
              } else {
                resolve(result?.secure_url || "");
              }
            }

          );
          stream.end(file);  // Upload the buffer to Cloudinary
        });
      });
  
      // Wait for all promises to resolve
      const imagePaths = await Promise.all(uploadPromises);
      return imagePaths;
    } catch (error) {
      throw new Error('Failed to upload images to Cloudinary');
    }
  };



  
// Export configurations and utility methods
export { cloudinary, storage, uploadSingleFileToCloudinary, uploadMultipleFilesToCloudinary ,deleteFileFromCloudinary,uploadMultipleFilesToCloudinaryV2};










// import dotenv from 'dotenv';
// import { v2 as cloudinary, ConfigOptions } from 'cloudinary';
// import { CloudinaryStorage,  } from 'multer-storage-cloudinary';
// import { Request } from 'express';
// //CloudinaryStorageOptions
// dotenv.config();

// // Cloudinary configuration
// const cloudinaryConfig: ConfigOptions = {
//   cloud_name: process.env.CL_CLOUD_NAME || '',
//   api_key: process.env.CL_API_KEY || '',
//   api_secret: process.env.CL_SECRET || '',
// };

// cloudinary.config(cloudinaryConfig);

// // Extend the Params type to include custom properties
// interface CustomParams {
//   folder: string;
//   format?: (req: Request, file: Express.Multer.File) => Promise<string> | string;
//   public_id?: (req: Request, file: Express.Multer.File) => string;
// }

// // Configure Cloudinary Storage for Multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'profile-images', // Folder in Cloudinary
//     format: async (req: Request, file: Express.Multer.File) => {
//       const mimeTypes: { [key: string]: string } = {
//         'image/jpeg': 'jpg',
//         'image/png': 'png',
//         'image/gif': 'gif',
//         'image/webp': 'webp',
//       };
//       return mimeTypes[file.mimetype] || 'jpg';
//     },
//     public_id: (req: Request, file: Express.Multer.File) => {
//       const name = file.originalname.replace(/\.[^/.]+$/, '');
//       return name;
//     },
//   } as CustomParams, // Type assertion to include custom properties
// });

// export { cloudinary, storage };
