import express, { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import authMiddleware from '../../Middleware/authMiddleware';
import { ApiResponse } from '../../Helper/apiResponse';
//import { use } from 'express/lib/application';
import { cloudinary,storage,uploadSingleFileToCloudinary,uploadMultipleFilesToCloudinary,deleteFileFromCloudinary } from '../../Helper/cloudry';
import path from 'path';
import { fstorage,bucketName,bucket,uploadSingleFileToFirebase ,uploadMultipleFilesToFirebase,deleteFileFromFirebase } from '../../Helper/firebase';
import * as fs from 'fs';
const router = Router();

/**
 * @openapi
 * /deleteUserById/{id}:
 *   get:
 *     summary: delete user by id.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: id of the user to be deleted.
 *     responses:
 *       200:
 *         description: user is deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedUser:
 *                   $ref: '#/components/schemas/AddUserRequestBody'
 *       401:
 *         description: No user found with the given ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errorobj:
 *                   type: object
 */
router.get("/",(req: Request, res: Response)=>{
    res.send("Home")
})


interface AddUserRequestBody {
    name: string;
    email: string;
    dob: string;
    isActive: boolean;
  }
  

/**
* @openapi
* /addUser:
*   post:
*     summary: Add a new user
*     description: This endpoint allows the creation of a new user by providing the user's name, email, date of birth, and active status.
*     tags:
*       - Users
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*                 example: Nusarat
*               email:
*                 type: string
*                 example: nusarat@example.com
*               dob:
*                 type: string
*                 format: date
*                 example: '1990-01-01'
*               isActive:
*                 type: boolean
*                 example: true
*     responses:
*       '200':
*         description: Successfully added the user
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: boolean
*                   example: false
*                 message:
*                   type: string
*                   example: User Added
*                 data:
*                   type: object
*                   properties:
*                     _id:
*                       type: string
*                       example: '605c72ef1532073d30f4e5d7'
*                     name:
*                       type: string
*                       example: nusarat 
*                     email:
*                       type: string
*                       example: nusarat@example.com
*                     dob:
*                       type: string
*                       format: date
*                       example: '1990-01-01'
*                     isActive:
*                       type: boolean
*                       example: true
*       '400':
*         description: Internal Server Error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: boolean
*                   example: true
*                 message:
*                   type: string
*                   example: Internal Server Error
*                 errorobj:
*                   type: object
*                   example: {}
*/
router.post('/addUser', async (req: Request<{}, {}, AddUserRequestBody>, res: Response) => {
    try {
      const { name, email, dob, isActive } = req.body;
  
      const tempUserObject = {
        name,
        email,
        dob,
        isActive,
      };
  
      
      
  
      res.status(200).json(new ApiResponse(200,"user added",null));
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: true, message: 'Internal Server Error', errorobj: error });
    }
  });





  router.post('/uploadTest2', async (req: Request, res: Response) => {
    try {
      // Define the local file path
      const loc: string = path.join(__dirname, 'abc.png');
  
      // Upload the image to Cloudinary
      const result = await cloudinary.uploader.upload(loc, {
        folder: 'profile-images', // Folder name in Cloudinary
        // use_filename: true, // Optional: Use the original filename
        unique_filename: true, // Ensure a unique filename
      });
  
      // Get the secure URL of the uploaded image
      const profileImageUrl: string = result.secure_url;
  
      // Send success response
      res.status(201).json({
        error: false,
        message: 'Upload successfully',
        data: profileImageUrl,
      });
    } catch (error) {
      console.error(error);
  
      // Handle errors
      res.status(500).json({
        error: true,
        message: (error as Error).message,
      });
    }
  });
  


  // API Endpoint to upload file
  router.post('/uploadTest', async (req: Request, res: Response) => {
    try {
      // Define the local file path
      const loc: string = path.join(__dirname, 'abc.png');

      // Check if the file exists locally
      if (!fs.existsSync(loc)) {
        throw new Error(`File not found at path: ${loc}`);
      }

      // Define the destination file name in Firebase Storage
      const destinationFileName = `profile-images/${path.basename(loc)}`;

      // Upload the file to Firebase Storage
      const [file] = await bucket.upload(loc, {
        destination: destinationFileName, // Destination path in bucket
        public: true, // Make the file publicly accessible
        metadata: {
          contentType: 'image/png', // Set the content type
        },
      });

      // Generate public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationFileName}`;

      // Send success response
      res.status(201).json({
        error: false,
        message: 'Upload successfully',
        data: publicUrl,
      });
    } catch (error) {
      console.error(error);

      // Handle errors
      res.status(500).json({
        error: true,
        message: (error as Error).message,
      });
    }
  });


  /**
 * API to upload a single file
 */
router.post('/uploadSingleCloud', async (req: Request, res: Response) => {
  try {
    const localPath: string = path.join(__dirname, 'abc.png');
    const secureUrl = await uploadSingleFileToCloudinary(localPath, 'profile-images');
    res.status(201).json({ error: false, message: 'Uploaded successfully', data: secureUrl });
  } catch (error :any) {
    res.status(500).json({ error: true, message: error.message });
  }
});

/**
 * API to upload multiple files
 */
router.post('/uploadMultipleCloud', async (req: Request, res: Response) => {
  try {
    const localPaths: string[] = [
      path.join(__dirname, 'abc.png'),
      path.join(__dirname, 'abc.png'),
    ];
    const secureUrls = await uploadMultipleFilesToCloudinary(localPaths, 'adds');
    res.status(201).json({ error: false, message: 'Uploaded successfully', data: secureUrls });
  } catch (error :any) {
    res.status(500).json({ error: true, message: error.message });
  }
});
  


router.post('/uploadSingleFb', async (req: Request, res: Response) => {
  try {
    const localPath = path.join(__dirname, 'abc.png');
    const publicUrl = await uploadSingleFileToFirebase(localPath, 'uploads/profile-images');
    res.status(201).json({ error: false, message: 'Uploaded successfully', data: publicUrl });
  } catch (error:any) {
    res.status(500).json({ error: true, message: error.message });
  }
});


router.post('/uploadMultipleFb', async (req: Request, res: Response) => {
  try {
    const localPaths = [
      path.join(__dirname, 'abc.png'),
      path.join(__dirname, 'abc.png'),
    ];
    const publicUrls = await uploadMultipleFilesToFirebase(localPaths, 'uploads/documents');
    res.status(201).json({ error: false, message: 'Uploaded successfully', data: publicUrls });
  } catch (error:any) {
    res.status(500).json({ error: true, message: error.message });
  }
});


router.delete('/deleteFileFb', async (req: Request, res: Response) => {
  try {
    let { fileUrl } = req.body; // Assume the file URL is sent in the request body
    fileUrl = "https://storage.googleapis.com/adminall-378ae.appspot.com/uploads/profile-images/f31778c3-aad5-432d-99aa-5bde3d6e84ba-abc.png"
    await deleteFileFromFirebase(fileUrl);
    res.status(200).json({ error: false, message: 'File deleted successfully' });
  } catch (error:any) {
    res.status(500).json({ error: true, message: error.message });
  }
});


router.delete('/deleteFileCloud', async (req: Request, res: Response) => {
  try {
    var url:string = "https://res.cloudinary.com/dddq4dxfd/image/upload/v1736480814/profile-images/b7b2278a-3460-4d37-8542-807ed8c31d59-abc.png"
    await deleteFileFromCloudinary(url)
    //(req.body.fileUrl);
    res.status(200).json({ error: false, message: 'File deleted successfully' });
  } catch (error:any) {
    res.status(500).json({ error: true, message: error.message });
  }
});



  
  
  



export default router;
