const multer = require('multer');
const path = require('path');

// Configure storage (using diskStorage or cloud storage like S3/Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/deliverables/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter matching allowed extensions: pdf, zip, png, jpg
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|zip|png|jpg|jpeg/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .pdf, .zip, .png, and .jpg files are allowed!'), false);
  }
};

const uploadDeliverable = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter,
});

module.exports = uploadDeliverable;