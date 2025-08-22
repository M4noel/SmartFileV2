import express from 'express';
import PDFMerger from 'pdf-merger-js';
import path from 'path';
import toolsController from '../controllers/toolsController.js';
import imageConverter from '../utils/imageConverter.js';
import imageResizer from '../utils/imageResizer.js';
import pdfEditor from '../utils/pdfEditor.js';
import { addCommentAnnotations } from '../utils/pdfEditor.js';
import documentToImageConverter from '../utils/pdfToImageConverter.js';
import pdfToDocumentConverter from '../utils/pdfToDocumentConverter.js';
import { convertDocument, detectFormat } from '../utils/documentConverter.js';
import { PDFDocument, degrees } from 'pdf-lib';
import multer from 'multer';
import ocrProcessor from '../utils/ocrProcessor.js';
import fileSizeValidator from '../middlewares/fileSizeValidator.js';
import tempStorageModule from '../utils/tempStorage.js';
import compressImage from '../utils/imageCompressor.js';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import pkg from 'node-qpdf';
const { decrypt } = pkg;
export default function router(upload) {
  const router = express.Router();
  // Rota para unir PDFs
  router.post('/merge-pdfs', upload.array('pdfs', 5), fileSizeValidator, toolsController.mergePdfs);

  // Rota para converter imagens
  router.post('/convert-image', upload.single('image'), fileSizeValidator, async (req, res) => {
    try {
      const { buffer } = req.file;
      const { format, quality } = req.body;
      

      // Validate format
      const supportedFormats = ['jpeg', 'png', 'webp', 'tiff'];
      if (!supportedFormats.includes(format.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Formato não suportado: ${format}`
        });
      }
      
      // Convert image
      const convertedImage = await imageConverter(buffer, format, { quality: parseInt(quality) || 80 });
      
      // Set appropriate content type
      let contentType = 'image/jpeg';
      switch (format.toLowerCase()) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'tiff':
          contentType = 'image/tiff';
          break;
      }
      
      res.set('Content-Type', contentType);
      res.send(convertedImage);
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao converter imagem',
        details: error.message
      });
    }
    
  });

  // Rota para comprimir imagens
 
// Rota de compressão
router.post('/compress-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const buffer = req.file.buffer;

    // Aqui você pode pegar parâmetros do body se quiser
    const quality = parseInt(req.body.quality || '80', 10);
    const format = req.body.format || 'jpeg';

    const compressed = await compressImage(buffer, { quality, format });

    res.set('Content-Type', `image/${format}`);
    res.send(compressed);
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    res.status(500).json({ error: 'Falha ao comprimir imagem' });
  }
});


  // Rota para redimensionar imagens
  router.post('/resize-image', upload.single('image'), fileSizeValidator, async (req, res) => {
    try {
      const { buffer } = req.file;
      const { width, height, fit, position, withoutEnlargement } = req.body;
      
      // Validate dimensions
      const targetWidth = parseInt(width);
      const targetHeight = parseInt(height);
      
      if ((!targetWidth || targetWidth <= 0) && (!targetHeight || targetHeight <= 0)) {
        return res.status(400).json({
          success: false,
          error: 'Dimensões inválidas. Pelo menos uma dimensão deve ser um número positivo.'
        });
      }
      
      // Resize image
      const resizedImage = await imageResizer(
      buffer,
      targetWidth || null,
      targetHeight || null,
      {
        fit: fit || 'inside',
        position: position || 'center',
        withoutEnlargement: withoutEnlargement === 'true'
      }
    );
      
      res.set('Content-Type', 'image/jpeg');
      res.send(resizedImage);
    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao redimensionar imagem',
        details: error.message
      });
    }
  });

  // Rota para editar PDFs
  router.post('/edit-pdf', upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'watermarkImage', maxCount: 1 }
  ]), async (req, res) => {
    try {
      if (!req.files || !req.files.pdf) {
        return res.status(400).json({ success: false, error: 'Arquivo PDF não enviado' });
      }

      const pdfBuffer = req.files.pdf[0].buffer;
      const { operation } = req.body;

      let options = {};
      if (req.body.options && req.body.options !== 'undefined') {
        options = JSON.parse(req.body.options);
      }

      // Handle watermark image if provided
      if (req.files.watermarkImage && req.files.watermarkImage[0]) {
        options.watermarkImageBuffer = req.files.watermarkImage[0].buffer;
      }

      let editedPdf;

      switch (operation) {
        case 'addAnnotations':
          if (!options.comments || !Array.isArray(options.comments) || options.comments.length === 0) {
            return res.status(400).json({ success: false, error: 'Campo comments é obrigatório para addAnnotations' });
          }
          editedPdf = await addCommentAnnotations(pdfBuffer, options.comments);
          break;
        case 'rotate':
          if (!options.rotations || !Array.isArray(options.rotations) || options.rotations.length === 0) {
            return res.status(400).json({ success: false, error: 'Campo rotations é obrigatório para rotate' });
          }
          editedPdf = await pdfEditor.rotatePages(pdfBuffer, options.rotations);
          break;
        case 'split':
          if (!options.splitPoints || !Array.isArray(options.splitPoints) || options.splitPoints.length === 0) {
            return res.status(400).json({ success: false, error: 'Campo splitPoints é obrigatório para split' });
          }
          // For split operation, we return multiple PDFs as a zip file
          const pdfBuffers = await pdfEditor.splitPdf(pdfBuffer, options.splitPoints);
          const archiver = (await import('archiver')).default;
          const archive = archiver('zip', {
            zlib: { level: 9 }
          });
          
          res.set('Content-Type', 'application/zip');
          res.set('Content-Disposition', 'attachment; filename="pdf-partes.zip"');
          archive.pipe(res);
          
          for (let i = 0; i < pdfBuffers.length; i++) {
            archive.append(pdfBuffers[i], { name: `parte-${i + 1}.pdf` });
          }
          
          await archive.finalize();
          return;
        case 'extract':
          if (!options.pageNumbers || !Array.isArray(options.pageNumbers) || options.pageNumbers.length === 0) {
            return res.status(400).json({ success: false, error: 'Campo pageNumbers é obrigatório para extract' });
          }
          editedPdf = await pdfEditor.extractPages(pdfBuffer, options.pageNumbers);
          break;
        case 'watermark':
          if (!options.watermarkText && !options.watermarkImageBuffer) {
            return res.status(400).json({ success: false, error: 'Campo watermarkText ou watermarkImageBuffer é obrigatório para watermark' });
          }
          editedPdf = await pdfEditor.addWatermark(pdfBuffer, options.watermarkText, options);
          break;
        case 'removePages':
          if (!options.pagesToRemove || !Array.isArray(options.pagesToRemove) || options.pagesToRemove.length === 0) {
            return res.status(400).json({ success: false, error: 'Campo pagesToRemove é obrigatório para removePages' });
          }
          editedPdf = await pdfEditor.removePages(pdfBuffer, options.pagesToRemove);
          break;
        default:
          return res.status(400).json({ success: false, error: `Operação não suportada: ${operation}` });
      }

      return res
        .status(200)
        .contentType('application/pdf')
        .send(Buffer.from(editedPdf));

    } catch (err) {
      console.error('Erro ao processar PDF:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Rota OCR
  router.post('/ocr-process', upload.single('file'), fileSizeValidator, async (req, res) => {
    try {
      console.log('Arquivo recebido:', req.file?.originalname);
      console.log('Body recebido:', req.body);

      const { buffer } = req.file;
      const { language, outputFormat } = req.body;

      // Processa OCR
      const ocrResult = await ocrProcessor(buffer, language || 'por');

      // Retorna no formato solicitado
      if (outputFormat === 'json') {
        res.json(ocrResult);
      } else {
        res.set('Content-Type', 'text/plain');
        res.send(ocrResult.text);
      }
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao processar OCR',
        details: error.message
      });
    }
  });
  
  // Rota para converter PDF para documentos
  router.post('/pdf-to-document', upload.single('pdf'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Arquivo PDF não enviado' });
      }

      const { buffer } = req.file;
      const { format } = req.body;

      // Validate format
      const supportedFormats = ['txt', 'docx', 'pptx', 'html'];
      if (!supportedFormats.includes(format?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Formato não suportado: ${format}. Use txt, docx, pptx ou html.`
        });
      }

      // Convert PDF to document
      const convertedDocument = await pdfToDocumentConverter(buffer, format.toLowerCase());

      // Set appropriate content type and filename
      let contentType = 'text/plain';
      let filename = 'documento.txt';
      
      switch (format.toLowerCase()) {
        case 'txt':
          contentType = 'text/plain';
          filename = 'documento.txt';
          break;
        case 'docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          filename = 'documento.docx';
          break;
        case 'pptx':
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          filename = 'apresentacao.pptx';
          break;
        case 'html':
          contentType = 'text/html';
          filename = 'documento.html';
          break;
      }

      res.set('Content-Type', contentType);
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(convertedDocument);
    } catch (error) {
      console.error('Erro ao converter PDF para documento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao converter PDF para documento',
        details: error.message
      });
    }
  });

  // Rota para converter documentos para imagens
  router.post('/document-to-images', upload.single('document'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Arquivo não enviado' });
      }

      const { buffer } = req.file;
      const { format, inputFormat } = req.body;
      const filename = req.file.originalname;

      // Detect input format if not provided
      const detectedInputFormat = inputFormat || detectDocumentFormat(filename);

      // Validate output format
      const supportedFormats = ['jpeg', 'png', 'webp'];
      if (!supportedFormats.includes(format?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Formato não suportado: ${format}. Use jpeg, png ou webp.`
        });
      }

      // Convert document to images
      const images = await documentToImageConverter(buffer, detectedInputFormat, format.toLowerCase());

      // Return images as a zip file
      const archiver = (await import('archiver')).default;
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Set headers
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename="documento-imagens.zip"');

      // Pipe archive to response
      archive.pipe(res);

      // Add each image to the archive
      for (const image of images) {
        const pageLabel = getPageLabel(detectedInputFormat);
        archive.append(image.buffer, { name: `${pageLabel.toLowerCase()}-${image.pageNumber}.${format.toLowerCase()}` });
      }

      // Finalize the archive
      await archive.finalize();
    } catch (error) {
      console.error('Erro ao converter documento para imagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao converter documento para imagens',
        details: error.message
      });
    }
  });

  // Helper function to detect document format from filename
  function detectDocumentFormat(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const formatMap = {
      'pdf': 'pdf',
      'docx': 'docx',
      'doc': 'docx',
      'pptx': 'pptx',
      'ppt': 'pptx',
      'xlsx': 'xlsx',
      'xls': 'xlsx',
      'txt': 'txt',
      'rtf': 'rtf'
    };
    return formatMap[ext] || 'pdf';
  }

  // Helper function to get page label
  function getPageLabel(format) {
    switch (format.toLowerCase()) {
      case 'pptx': return 'Slide';
      case 'xlsx': return 'Planilha';
      default: return 'Pagina';
    }
  }

  // Rota para converter PDF para imagens (mantida para compatibilidade)
  router.post('/pdf-to-images', upload.single('pdf'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Arquivo PDF não enviado' });
      }

      const { buffer } = req.file;
      const { format } = req.body;

      // Validate format
      const supportedFormats = ['jpeg', 'png', 'webp'];
      if (!supportedFormats.includes(format?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Formato não suportado: ${format}. Use jpeg, png ou webp.`
        });
      }

      // Convert PDF to images
      const images = await documentToImageConverter(buffer, 'pdf', format.toLowerCase());

      // Return images as a zip file
      const archiver = (await import('archiver')).default;
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Set headers
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename="pdf-imagens.zip"');

      // Pipe archive to response
      archive.pipe(res);

      // Add each image to the archive
      for (const image of images) {
        archive.append(image.buffer, { name: `page-${image.pageNumber}.${format.toLowerCase()}` });
      }

      // Finalize the archive
      await archive.finalize();
    } catch (error) {
      console.error('Erro ao converter PDF para imagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao converter PDF para imagens',
        details: error.message
      });
    }
  });

  // Rota para criar PDF a partir de imagens
  router.post('/images-to-pdf', upload.array('images'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: 'Nenhuma imagem enviada' });
      }

      // Extract image buffers
      const imageBuffers = req.files.map(file => file.buffer);

      // Create PDF from images
      const pdfBuffer = await pdfEditor.createPdfFromImages(imageBuffers);

      // Set headers
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'attachment; filename="imagens-convertidas.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao criar PDF a partir de imagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao criar PDF a partir de imagens',
        details: error.message
      });
    }
  });

  // Rota para conversão abrangente de documentos
  router.post('/convert-document', upload.single('file'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
      }

      const { buffer } = req.file;
      const { inputFormat, outputFormat, quality } = req.body;
      const filename = req.file.originalname;

      // Detect input format if not provided
      const detectedInputFormat = inputFormat || await detectFormat(buffer, filename);
      
      // Validate formats
      const { SUPPORTED_INPUT_FORMATS, SUPPORTED_OUTPUT_FORMATS } = await import('../utils/documentConverter.js');
      
      if (!SUPPORTED_INPUT_FORMATS.includes(detectedInputFormat?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Formato de entrada não suportado: ${detectedInputFormat}`
        });
      }
      
      if (!SUPPORTED_OUTPUT_FORMATS.includes(outputFormat?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Formato de saída não suportado: ${outputFormat}`
        });
      }

      // Convert document
      const convertedBuffer = await convertDocument(
        buffer, 
        detectedInputFormat.toLowerCase(), 
        outputFormat.toLowerCase(),
        { quality: parseInt(quality) || 80 }
      );

      // Set appropriate content type and filename
      let contentType = 'application/octet-stream';
      let outputFilename = `documento-convertido.${outputFormat.toLowerCase()}`;
      
      switch (outputFormat.toLowerCase()) {
        case 'pdf':
          contentType = 'application/pdf';
          outputFilename = 'documento.pdf';
          break;
        case 'docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          outputFilename = 'documento.docx';
          break;
        case 'xlsx':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          outputFilename = 'planilha.xlsx';
          break;
        case 'pptx':
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          outputFilename = 'apresentacao.pptx';
          break;
        case 'txt':
          contentType = 'text/plain';
          outputFilename = 'documento.txt';
          break;
        case 'csv':
          contentType = 'text/csv';
          outputFilename = 'dados.csv';
          break;
        case 'json':
          contentType = 'application/json';
          outputFilename = 'dados.json';
          break;
        case 'xml':
          contentType = 'application/xml';
          outputFilename = 'documento.xml';
          break;
        case 'html':
          contentType = 'text/html';
          outputFilename = 'documento.html';
          break;
        case 'md':
          contentType = 'text/markdown';
          outputFilename = 'documento.md';
          break;
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          outputFilename = 'imagem.jpg';
          break;
        case 'png':
          contentType = 'image/png';
          outputFilename = 'imagem.png';
          break;
        case 'webp':
          contentType = 'image/webp';
          outputFilename = 'imagem.webp';
          break;
        case 'tiff':
          contentType = 'image/tiff';
          outputFilename = 'imagem.tiff';
          break;
      }

      res.set('Content-Type', contentType);
      res.set('Content-Disposition', `attachment; filename="${outputFilename}"`);
      res.send(convertedBuffer);
    } catch (error) {
      console.error('Erro ao converter documento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao converter documento',
        details: error.message
      });
    }
  });

  // Rota para conversão em lote de documentos
  router.post('/convert-documents-batch', upload.array('files'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
      }

      const { outputFormat, quality } = req.body;
      
      // Validate output format
      const { SUPPORTED_OUTPUT_FORMATS } = await import('../utils/documentConverter.js');
      
      if (!SUPPORTED_OUTPUT_FORMATS.includes(outputFormat?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Formato de saída não suportado: ${outputFormat}`
        });
      }

      // Create ZIP archive for batch results
      const archiver = (await import('archiver')).default;
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      // Set headers
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename="documentos-convertidos.zip"');

      // Pipe archive to response
      archive.pipe(res);

      // Process each file
      for (const file of req.files) {
        try {
          const { buffer } = file;
          const filename = file.originalname;
          
          // Detect input format
          const detectedInputFormat = await detectFormat(buffer, filename);
          
          // Convert document
          const convertedBuffer = await convertDocument(
            buffer, 
            detectedInputFormat.toLowerCase(), 
            outputFormat.toLowerCase(),
            { quality: parseInt(quality) || 80 }
          );
          
          // Add to archive with appropriate extension
          const nameWithoutExt = path.basename(filename, path.extname(filename));
          archive.append(convertedBuffer, { 
            name: `${nameWithoutExt}.${outputFormat.toLowerCase()}` 
          });
        } catch (fileError) {
          console.error(`Erro ao converter arquivo ${file.originalname}:`, fileError);
          // Continue with other files
        }
      }

      // Finalize the archive
      await archive.finalize();
    } catch (error) {
      console.error('Erro ao converter documentos em lote:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao converter documentos em lote',
        details: error.message
      });
    }
  });

  // Rota para armazenar arquivo temporariamente
  router.post('/temp-store', upload.single('file'), fileSizeValidator, async (req, res) => {
    try {
      const { buffer } = req.file;
      const filename = req.file.originalname;
      
      const storedFile = await tempStorageModule.default.storeFile(buffer, filename);
      
      res.json({
        success: true,
        fileId: storedFile.id,
        filename: storedFile.originalName
      });
    } catch (error) {
      console.error('Erro ao armazenar arquivo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao armazenar arquivo',
        details: error.message
      });
    }
  });

  // Rota para download em lote
  router.post('/batch-download', async (req, res) => {
    try {
      const { fileIds } = req.body;
      
      // Retrieve files
      const files = [];
      
      for (const fileId of fileIds) {
        try {
          const file = await tempStorageModule.default.retrieveFile(fileId);
          files.push(file);
        } catch (error) {
          console.warn(`Could not retrieve file ${fileId}:`, error.message);
        }
      }
      
      if (files.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Nenhum arquivo encontrado'
        });
      }
      
      // Create ZIP archive
      const zipBuffer = await tempStorageModule.default.createZipArchive(files);
      
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename="arquivos-processados.zip"');
      res.send(zipBuffer);
    } catch (error) {
      console.error('Erro ao criar download em lote:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao criar download em lote',
        details: error.message
      });
    }
  });

  // Rota para recuperar arquivos corrompidos (Word, Excel, etc.)
  router.post('/recover-document', upload.single('file'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
      }

      const { buffer } = req.file;
      const { fileType } = req.body;
      const filename = req.file.originalname;

      // Detect file type if not provided
      let detectedFileType = fileType;
      if (!detectedFileType) {
        detectedFileType = await detectFormat(buffer, filename);
      }

      // Recover document
      const recoveredBuffer = await pdfEditor.recoverDocument(buffer, detectedFileType);

      // With the improved recovery flow, we always return a PDF for PDF files
      // Set appropriate content type and filename
      let contentType = 'application/octet-stream';
      let outputFilename = `recuperado-${filename}`;
      
      switch (detectedFileType.toLowerCase()) {
        case 'docx':
          // For Word documents, we might return text content
          // Check if the recovered buffer is text content
          if (recoveredBuffer.toString('utf8').startsWith('%PDF')) {
            // It's actually a PDF, so return as PDF
            contentType = 'application/pdf';
            outputFilename = filename.replace(/\.[^/.]+$/, '') + '-recuperado.pdf';
          } else {
            // Return as TXT
            contentType = 'text/plain';
            outputFilename = filename.replace(/\.[^/.]+$/, '') + '-recuperado.txt';
          }
          break;
        case 'xlsx':
          // For Excel documents, we might return text content
          // Check if the recovered buffer is text content
          if (recoveredBuffer.toString('utf8').startsWith('%PDF')) {
            // It's actually a PDF, so return as PDF
            contentType = 'application/pdf';
            outputFilename = filename.replace(/\.[^/.]+$/, '') + '-recuperado.pdf';
          } else {
            // Return as TXT
            contentType = 'text/plain';
            outputFilename = filename.replace(/\.[^/.]+$/, '') + '-recuperado.txt';
          }
          break;
        case 'pptx':
          // For PowerPoint documents, we might return text content
          // Check if the recovered buffer is text content
          if (recoveredBuffer.toString('utf8').startsWith('%PDF')) {
            // It's actually a PDF, so return as PDF
            contentType = 'application/pdf';
            outputFilename = filename.replace(/\.[^/.]+$/, '') + '-recuperado.pdf';
          } else {
            // Return as TXT
            contentType = 'text/plain';
            outputFilename = filename.replace(/\.[^/.]+$/, '') + '-recuperado.txt';
          }
          break;
        case 'pdf':
          // For PDF files, always return as PDF
          contentType = 'application/pdf';
          outputFilename = filename.replace(/\.[^/.]+$/, '') + '-recuperado.pdf';
          break;
        default:
          // For other file types, try to preserve original extension
          const ext = path.extname(filename);
          if (ext) {
            outputFilename = filename.replace(/\.[^/.]+$/, '') + `-recuperado${ext}`;
          } else {
            outputFilename = filename + '-recuperado';
          }
          break;
      }

      res.set('Content-Type', contentType);
      res.set('Content-Disposition', `attachment; filename="${outputFilename}"`);
      res.send(recoveredBuffer);
    } catch (error) {
      console.error('Erro ao recuperar documento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao recuperar documento',
        details: error.message
      });
    }
  });

  // Rota para gerar QR Code
  router.post('/generate-qr-code', async (req, res) => {
    try {
      const { text, format } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Texto ou URL é obrigatório'
        });
      }
      
      // Validate format
      const supportedFormats = ['png', 'svg'];
      if (!format || !supportedFormats.includes(format.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Formato não suportado: ${format}. Use png ou svg.`
        });
      }
      
      // Generate QR code using qrcode library
      if (format.toLowerCase() === 'svg') {
        const svg = await QRCode.toString(text, { type: 'svg' });
        res.set('Content-Type', 'image/svg+xml');
        res.send(svg);
      } else {
        const buffer = await QRCode.toBuffer(text, { type: 'png' });
        res.set('Content-Type', 'image/png');
        res.send(buffer);
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao gerar QR Code',
        details: error.message
      });
    }
  });

  // Rota para receber emails de interesse de IA Tools
  router.post('/notify-ia-tools', async (req, res) => {
    try {
      const { email, feature } = req.body || {};
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'Email inválido' });
      }

      // Tenta enviar email para o administrador (Murilo)
      const adminRecipient = 'murilomanoel221@gmail.com';
      const subject = 'Novo interesse em IA Tools';
      const text = `Um usuário solicitou notificação para IA Tools.\n\n` +
                   `Email do usuário: ${email}\n` +
                   `Recurso: ${feature || 'IA Tools'}\n` +
                   `Data: ${new Date().toISOString()}`;

      // Transporter baseado em variáveis de ambiente
      let transporter;
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
      } else if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
        });
      }

      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'no-reply@smartfiles.local',
            to: adminRecipient,
            subject,
            text
          });
          return res.json({ success: true });
        } catch (sendErr) {
          console.warn('Falha ao enviar email (seguirá com fallback):', sendErr?.message);
        }
      }

      // Fallback: loga e retorna sucesso para não exibir erro técnico ao usuário
      console.log(`[notify-ia-tools] Registro (sem envio SMTP configurado):`, { email, feature });
      return res.json({ success: true });
    } catch (error) {
      console.error('Erro ao registrar notificação IA Tools:', error);
      res.status(500).json({ success: false, error: 'Erro interno ao registrar notificação' });
    }
  });

  // Rota para gerar PDFs simples
  router.post('/generate-pdf', upload.fields([
    { name: 'image', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const { type, content, title, pageSize, fontSize, tableData, tableHeaders } = req.body;
      
      let pdfBuffer;
      
      switch (type) {
        case 'text':
          if (!content) {
            return res.status(400).json({ success: false, error: 'Conteúdo de texto é obrigatório' });
          }
          pdfBuffer = await pdfEditor.createPdfFromText(content, { title, pageSize, fontSize });
          break;
          
        case 'image':
          if (!req.files || !req.files.image) {
            return res.status(400).json({ success: false, error: 'Imagem é obrigatória' });
          }
          const imageBuffer = req.files.image[0].buffer;
          pdfBuffer = await pdfEditor.createPdfFromImages([imageBuffer], { pageSize });
          break;
          
        case 'table':
          if (!tableData) {
            return res.status(400).json({ success: false, error: 'Dados da tabela são obrigatórios' });
          }
          const parsedTableData = JSON.parse(tableData);
          const parsedTableHeaders = tableHeaders ? JSON.parse(tableHeaders) : [];
          pdfBuffer = await pdfEditor.createPdfFromTable(parsedTableData, parsedTableHeaders, { title, pageSize });
          break;
          
        default:
          return res.status(400).json({ success: false, error: `Tipo não suportado: ${type}` });
      }
      
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'attachment; filename="documento.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao gerar PDF',
        details: error.message
      });
    }
  });

  // Rota para gerar PDFs combinados
  router.post('/generate-combined-pdf', upload.any(), async (req, res) => {
    try {
      const { title, pageSize, fontSize, contentData } = req.body;
      
      // Parse content data
      const parsedContentData = JSON.parse(contentData);
      
      // Process content items
      const contentItems = [];
      let imageIndex = 0; // Track the actual image index
      for (let i = 0; i < parsedContentData.length; i++) {
        const item = parsedContentData[i];
        const contentItem = {
          type: item.type
        };
        
        switch (item.type) {
          case 'text':
            contentItem.content = item.content || '';
            break;
            
          case 'image':
            // Find the image file for this item
            const fieldName = `image_${imageIndex}`;
            if (req.files && req.files[fieldName]) {
              // Access the file by field name
              contentItem.imageBuffer = req.files[fieldName][0].buffer;
              imageIndex++;
            }
            break;
            
          case 'table':
            if (item.tableData) {
              contentItem.tableData = item.tableData;
              contentItem.tableHeaders = item.tableHeaders || [];
            }
            break;
        }
        
        contentItems.push(contentItem);
      }
      
      // Generate PDF from multiple content types
      const pdfBuffer = await pdfEditor.createPdfFromMultipleContent(contentItems, { title, pageSize, fontSize });
      
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'attachment; filename="documento.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar PDF combinado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao gerar PDF combinado',
        details: error.message
      });
    }
  });
// Rota para adicionar senha a PDF
  router.post('/add-pdf-password', upload.single('pdf'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Arquivo PDF não enviado' });
      }

      const { buffer } = req.file;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ success: false, error: 'Senha não fornecida' });
      }

      // Criar um arquivo temporário para o PDF original
      const fs = await import('fs');
      const os = await import('os');
      const path = await import('path');
      
      const tempDir = os.tmpdir();
      const inputPath = path.join(tempDir, `original-${Date.now()}.pdf`);
      const outputPath = path.join(tempDir, `protected-${Date.now()}.pdf`);
      
      // Escrever o buffer em um arquivo temporário
      await fs.promises.writeFile(inputPath, buffer);
      
      try {
        // Usar node-qpdf para adicionar senha ao PDF
        try {
          // Set the full path to qpdf executable for node-qpdf
          const qpdfPath = path.join(process.cwd(), '..', 'bin', 'qpdf.exe');
          
          // Comando para adicionar senha usando qpdf
          const { exec } = await import('child_process');
          const { promisify } = await import('util');
          const execPromise = promisify(exec);
          
          // Comando para criptografar o PDF com senha
          const command = `"${qpdfPath}" --encrypt "${password}" "${password}" 256 -- "${inputPath}" "${outputPath}"`;
          
          await execPromise(command);
          
          // Ler o arquivo protegido
          const protectedBuffer = await fs.promises.readFile(outputPath);
          
          // Enviar o PDF com senha
          res.set('Content-Type', 'application/pdf');
          res.set('Content-Disposition', 'attachment; filename="pdf-com-senha.pdf"');
          res.send(protectedBuffer);
        } catch (qpdfError) {
          console.log('Erro ao adicionar senha com qpdf:', qpdfError.message);
          throw new Error('Falha ao adicionar senha ao PDF');
        }
      } catch (encryptError) {
        // Se houver erro na criptografia, retornar erro específico
        return res.status(400).json({
          success: false,
          error: 'Erro ao adicionar senha ao PDF. Verifique se o PDF já está protegido por senha.'
        });
      } finally {
        // Limpar arquivos temporários
        try {
          if (fs.promises.access) {
            if (await fs.promises.access(inputPath).then(() => true).catch(() => false)) {
              await fs.promises.unlink(inputPath);
            }
            if (await fs.promises.access(outputPath).then(() => true).catch(() => false)) {
              await fs.promises.unlink(outputPath);
            }
          }
        } catch (cleanupError) {
          console.warn('Erro ao limpar arquivos temporários:', cleanupError);
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar senha ao PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao adicionar senha ao PDF',
        details: error.message
      });
    }
  });

  // Rota para remover senha de PDF
  router.post('/remove-pdf-password', upload.single('pdf'), fileSizeValidator, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Arquivo PDF não enviado' });
      }

      const { buffer } = req.file;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ success: false, error: 'Senha não fornecida' });
      }

      // Criar um arquivo temporário para o PDF protegido
      const fs = await import('fs');
      const os = await import('os');
      const path = await import('path');
      
      const tempDir = os.tmpdir();
      const inputPath = path.join(tempDir, `protected-${Date.now()}.pdf`);
      const outputPath = path.join(tempDir, `unprotected-${Date.now()}.pdf`);
      
      // Escrever o buffer em um arquivo temporário
      await fs.promises.writeFile(inputPath, buffer);
      
      try {
        // Tentar usar node-qpdf primeiro
        try {
          // Set the full path to qpdf executable for node-qpdf
          const qpdfPath = path.join(process.cwd(), 'bin', 'qpdf.exe');
          
          // Create a temporary copy of the node-qpdf module with the correct path
          const qpdf = { ...decrypt };
          qpdf.command = qpdfPath;
          
          // node-qpdf.decrypt retorna um stream, não uma Promise
          const decryptStream = qpdf.decrypt(inputPath, password);
          if (decryptStream && decryptStream.pipe) {
            // Criar um stream de escrita para o arquivo de saída
            const writeStream = fs.createWriteStream(outputPath);
            decryptStream.pipe(writeStream);
            
            // Aguardar a conclusão da escrita
            await new Promise((resolve, reject) => {
              writeStream.on('finish', resolve);
              writeStream.on('error', reject);
              decryptStream.on('error', reject);
            });
          } else {
            throw new Error('node-qpdf não retornou um stream válido');
          }
        } catch (qpdfError) {
          console.log('node-qpdf falhou, tentando alternativa...', qpdfError.message);
          
          // Alternativa: usar pdf-lib para tentar remover a senha
          const { PDFDocument } = await import('pdf-lib');
          
          try {
            const pdfDoc = await PDFDocument.load(buffer, {
              password,
              ignoreEncryption: true // This is important for handling encrypted PDFs
            });
            const unprotectedBuffer = await pdfDoc.save();
            
            // Enviar o PDF sem senha
            res.set('Content-Type', 'application/pdf');
            res.set('Content-Disposition', 'attachment; filename="pdf-sem-senha.pdf"');
            res.send(Buffer.from(unprotectedBuffer));
            
            // Limpar arquivos temporários
            try {
              await fs.promises.unlink(inputPath);
            } catch (cleanupError) {
              console.warn('Erro ao limpar arquivo temporário:', cleanupError);
            }
            return;
          } catch (pdfLibError) {
            console.log('pdf-lib também falhou:', pdfLibError.message);
            throw new Error('Senha incorreta ou PDF não pode ser descriptografado');
          }
        }
        
        // Se chegou aqui, node-qpdf funcionou
        const unprotectedBuffer = await fs.promises.readFile(outputPath);
        
        // Enviar o PDF sem senha
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename="pdf-sem-senha.pdf"');
        res.send(unprotectedBuffer);
      } catch (decryptError) {
        // Se houver erro na descriptografia, retornar erro específico
        return res.status(400).json({
          success: false,
          error: 'Senha incorreta ou erro ao remover senha. Verifique se a senha está correta.'
        });
      } finally {
        // Limpar arquivos temporários
        try {
          if (fs.promises.access) {
            if (await fs.promises.access(inputPath).then(() => true).catch(() => false)) {
              await fs.promises.unlink(inputPath);
            }
            if (await fs.promises.access(outputPath).then(() => true).catch(() => false)) {
              await fs.promises.unlink(outputPath);
            }
          }
        } catch (cleanupError) {
          console.warn('Erro ao limpar arquivos temporários:', cleanupError);
        }
      }
    } catch (error) {
      console.error('Erro ao remover senha do PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao remover senha do PDF',
        details: error.message
      });
    }
  });

  return router;
}