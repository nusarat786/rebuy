import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// Initialize Firebase Admin with the service account
admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || ''))),
  storageBucket: 'interviewqestion.appspot.com', // Your Firebase storage bucket name
});

// Create a Google Cloud Storage client
const fstorage = new Storage();

const bucketName: string = process.env.FBUCKETNAME || 'interviewqestion.appspot.com';
const bucket = fstorage.bucket(bucketName);

console.log(`Firebase Admin and Storage initialized for bucket: ${bucketName}`);

/**
 * Upload a single file to Firebase Storage
 * @param localPath - Path to the local file
 * @param destination - Destination path in the bucket
 * @returns Public URL of the uploaded file
 */
const uploadSingleFileToFirebase = async (localPath: string, destination: string): Promise<string> => {
  const uniqueDestination = `${destination}/${uuidv4()}-${path.basename(localPath)}`;
  await bucket.upload(localPath, {
    destination: uniqueDestination,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  // Get the public URL
  return `https://storage.googleapis.com/${bucketName}/${uniqueDestination}`;
};

/**
 * Upload multiple files to Firebase Storage
 * @param localPaths - Array of local file paths
 * @param destination - Destination folder in the bucket
 * @returns Array of public URLs for the uploaded files
 */
const uploadMultipleFilesToFirebase = async (localPaths: string[], destination: string): Promise<string[]> => {
  const uploadPromises = localPaths.map((localPath) => uploadSingleFileToFirebase(localPath, destination));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Firebase Storage
 * @param fileUrl - Public URL of the file
 */
const deleteFileFromFirebase = async (fileUrl: string): Promise<void> => {
    
      // Extract the file path from the URL
      const url = new URL(fileUrl);
      const filePath = url.pathname.replace(`/${bucketName}/`, ''); // Remove the bucket name part
  
      // Delete the file
      await bucket.file(filePath).delete();
      console.log(`File deleted from Firebase Storage: ${filePath}`);
    
  };
  

// Export configurations and utility methods
export { bucketName, fstorage, bucket, uploadSingleFileToFirebase, uploadMultipleFilesToFirebase, deleteFileFromFirebase };









// import * as admin from 'firebase-admin';
// import { Storage } from '@google-cloud/storage';
// import * as path from 'path';

// // Initialize Firebase Admin with the service account
// admin.initializeApp({
//   credential: admin.credential.cert(require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || ''))),
//   storageBucket: 'interviewqestion.appspot.com', // Your Firebase storage bucket name
// });

// // Create a Google Cloud Storage client
// const fstorage = new Storage();

// const bucketName:string = process.env.FBUCKETNAME || " ";

// //'interviewqestion.appspot.com'; // Your bucket name

// // // Usage example (optional)
// // const bucket = fstorage.bucket(bucketName);

// console.log(`Firebase Admin and Storage initialized for bucket: ${bucketName}`);

// const bucket = fstorage.bucket(bucketName);

// export {bucketName,fstorage,bucket}