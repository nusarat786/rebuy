import multer from 'multer';
import path from 'path';
export const uploadPath = path.join(__dirname, 'uploads');


// Set the file storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Save the file in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate a unique filename
  }
});

// Create multer instance with the storage configuration
const upload = multer({ storage: storage });

export default upload;
