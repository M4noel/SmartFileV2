/**
 * Middleware to validate file sizes
 */
export default (req, res, next) => {
  // Check if we have files to validate
  if (req.files) {
    // Multiple files
    const oversizedFiles = req.files.filter(file => file.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Arquivo ${oversizedFiles[0].originalname} excede o limite de 50MB`
      });
    }
  } else if (req.file && req.file.size > 50 * 1024 * 1024) {
    // Single file
    return res.status(400).json({
      success: false,
      error: `Arquivo ${req.file.originalname} excede o limite de 50MB`
    });
  }
  
  next();
};