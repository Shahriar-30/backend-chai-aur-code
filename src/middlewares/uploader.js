// middleware/uploader.js
import multer from "multer";

// ===== Memory Storage =====
const storage = multer.memoryStorage();

// ===== File Filter =====
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

// ===== Multer Instance =====
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export default upload;
