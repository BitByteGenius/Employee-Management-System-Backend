const multer = require('multer');
const path = require('path');

// Configure memory storage so files are streamed directly to Cloudinary
const storage = multer.memoryStorage();

// File filter matching allowed extensions: pdf, zip, png, jpg, docx, xlsx, etc.
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|zip|png|jpg|jpeg|docx|doc|xlsx|xls|csv|txt|webp|svg|rar|7z/i;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed formats: PDF, ZIP, PNG, JPG, DOCX, XLSX, CSV, TXT.'), false);
  }
};

const uploadDeliverable = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter,
});

module.exports = uploadDeliverable;