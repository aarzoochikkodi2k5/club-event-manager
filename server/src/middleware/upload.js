import multer from 'multer';

export default multer({
  storage: multer.memoryStorage(),                 // keep the file in memory, not on disk
  limits: { fileSize: 2 * 1024 * 1024 },           // 2 MB max
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});