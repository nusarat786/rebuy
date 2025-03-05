import multer from 'multer';

// Use memory storage to store images in buffer instead of saving on disk
const storage = multer.memoryStorage(); 

// Create multer instance
const uploadV2 = multer({ storage });

export default uploadV2;
