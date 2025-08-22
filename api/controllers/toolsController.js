import pdfMerge from '../utils/pdfMerge.js';
import { compressImage } from '../utils/compress-image.js'; // note as chaves se for named export

export default {
  async compressImage(req, res) {
    try {
      const { buffer } = req.file;
      const { quality = 70, format = 'jpeg' } = req.body;
      
      // Compress the image using our utility
      const compressedImage = await compressImage(buffer, {
        quality: parseInt(quality),
        format
      });
      
      // Set content type based on format
      let contentType = 'image/jpeg';
      switch (format.toLowerCase()) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'avif':
          contentType = 'image/avif';
          break;
      }

      res.set('Content-Type', contentType);
      res.send(compressedImage);
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao comprimir imagem',
        details: error.message
      });
    }
  },

  async mergePdfs(req, res) {
    try {
      const mergedPdf = await pdfMerge(req.files);
      res.set('Content-Type', 'application/pdf');
      res.send(mergedPdf);
    } catch (error) {
      console.error('Erro ao unir PDFs:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao unir PDFs',
        details: error.message
      });
    }
  }
};
