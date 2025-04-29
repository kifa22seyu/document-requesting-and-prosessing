const multer = require('multer');
const sharp = require('sharp');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});

exports.upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'), false);
  }
});

exports.resizeProfileImage = async (req, res, next) => {
  if (!req.file) return next();
  
  await sharp(req.file.path)
    .resize(500, 500)
    .jpeg({ quality: 90 })
    .toFile(`uploads/profile-${req.user.id}.jpeg`);
  
  req.file.filename = `profile-${req.user.id}.jpeg`;
  next();
};