const multer = require('multer');
const path = require('path');
const fs = require('fs');

const logoUploadPath = path.join(__dirname, '..', 'public', 'logo');

const allowedMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp'
]);

function ensureUploadDirectory() {
  if (!fs.existsSync(logoUploadPath)) {
    fs.mkdirSync(logoUploadPath, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    ensureUploadDirectory();
    cb(null, logoUploadPath);
  },
  filename(req, file, cb) {
    const originalName = file.originalname || 'logo';
    const fileExtension = path.extname(originalName).toLowerCase();
    const rawBaseName = path.basename(originalName, fileExtension);
    const safeBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'logo';

    let fileName = `${safeBaseName}_${Date.now()}${fileExtension}`;
    let fileIndex = 1;

    while (fs.existsSync(path.join(logoUploadPath, fileName))) {
      fileName = `${safeBaseName}_${Date.now()}_${fileIndex}${fileExtension}`;
      fileIndex += 1;
    }

    cb(null, fileName);
  }
});

function fileFilter(req, file, cb) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error('Only PNG, JPG, SVG and WebP files are allowed for logo upload'));
  }
  return cb(null, true);
}

const uploadLogo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

module.exports = uploadLogo;