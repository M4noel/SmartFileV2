import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supported formats
const SUPPORTED_INPUT_FORMATS = [
  'pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv', 
  'json', 'xml', 'html', 'md', 'jpg', 'jpeg', 'png', 'webp', 'tiff'
];

// Only support image output formats
const SUPPORTED_OUTPUT_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'tiff'];

/**
 * Detect file format from buffer or extension
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @returns {string} Detected format
 */
export async function detectFormat(buffer, filename) {
  try {
    // Try to detect from file extension first
    const ext = path.extname(filename).toLowerCase().slice(1);
    if (SUPPORTED_INPUT_FORMATS.includes(ext)) {
      return ext;
    }
    
    // Try to detect from buffer content
    const header = buffer.slice(0, 100).toString('hex');
    
    // PDF detection
    if (header.startsWith('25504446')) return 'pdf';
    
    // Image format detection
    if (header.startsWith('ffd8ffe0') || header.startsWith('ffd8ffe1') || 
        header.startsWith('ffd8ffe2') || header.startsWith('ffd8ffe3') || 
        header.startsWith('ffd8ffe8')) return 'jpg';
    
    if (header.startsWith('89504e47')) return 'png';
    
    if (header.startsWith('52494646') && buffer.slice(8, 12).toString('hex') === '57454250') return 'webp';
    
    if (header.startsWith('49492a00') || header.startsWith('4d4d002a')) return 'tiff';
    
    // Text-based formats (fallback)
    const text = buffer.toString('utf8', 0, 1000);
    
    // JSON detection
    try {
      JSON.parse(text.trim());
      return 'json';
    } catch {}
    
    // XML detection
    if (text.trim().startsWith('<?xml') || text.trim().startsWith('<')) {
      if (text.includes('<worksheet')) return 'xlsx';
      if (text.includes('<Presentation')) return 'pptx';
      if (text.includes('<w:document')) return 'docx';
      return 'xml';
    }
    
    // Markdown detection
    if (text.includes('# ') || text.includes('## ') || text.includes('### ')) {
      return 'md';
    }
    
    // CSV detection
    if (text.includes(',')) {
      const lines = text.split('\n');
      if (lines.length > 1) {
        const firstLineFields = lines[0].split(',').length;
        const secondLineFields = lines[1].split(',').length;
        if (firstLineFields === secondLineFields && firstLineFields > 1) {
          return 'csv';
        }
      }
    }
    
    // Default to text
    return 'txt';
  } catch (error) {
    console.error('Error detecting format:', error);
    // Fallback to extension-based detection
    const ext = path.extname(filename).toLowerCase().slice(1);
    return SUPPORTED_INPUT_FORMATS.includes(ext) ? ext : 'txt';
  }
}

/**
 * Convert document from one format to another
 * @param {Buffer} buffer - Input file buffer
 * @param {string} inputFormat - Input format
 * @param {string} outputFormat - Output format
 * @param {Object} options - Conversion options
 * @returns {Buffer} Converted document buffer
 */
export async function convertDocument(buffer, inputFormat, outputFormat, options = {}) {
  try {
    // Validate formats
    if (!SUPPORTED_INPUT_FORMATS.includes(inputFormat)) {
      throw new Error(`Unsupported input format: ${inputFormat}`);
    }
    
    // Only support image output formats
    if (!SUPPORTED_OUTPUT_FORMATS.includes(outputFormat)) {
      throw new Error(`Unsupported output format: ${outputFormat}. Only image formats (jpg, jpeg, png, webp, tiff) are supported.`);
    }
    
    // If same format, return as is
    if (inputFormat === outputFormat) {
      return buffer;
    }
    
    // Handle PDF to image conversion
    if (inputFormat === 'pdf') {
      return await convertPdfToImage(buffer, outputFormat, options);
    }
    
    // Handle image to image conversion
    if (['jpg', 'jpeg', 'png', 'webp', 'tiff'].includes(inputFormat)) {
      return await convertImage(buffer, inputFormat, outputFormat, options);
    }
    
    // Handle other formats to image conversion
    return await convertToImage(buffer, inputFormat, outputFormat, options);
  } catch (error) {
    throw new Error(`Document conversion failed: ${error.message}`);
  }
}

/**
 * Convert PDF to image
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} outputFormat - Output image format
 * @param {Object} options - Conversion options
 * @returns {Buffer} Converted image buffer
 */
async function convertPdfToImage(pdfBuffer, outputFormat, options) {
  try {
    // Load PDF document with pdf-lib to get basic information
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    // Create a more realistic placeholder image with PDF information
    const width = 800;
    const height = 600;
    
    // Create SVG with PDF information
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <rect x="50" y="50" width="${width-100}" height="${height-100}" fill="white" stroke="#ccc" stroke-width="2" rx="10"/>
        <text x="50%" y="100" font-family="Arial" font-size="24" text-anchor="middle" fill="#333">PDF Document</text>
        <text x="50%" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="#666">Converted to Image</text>
        <text x="50%" y="200" font-family="Arial" font-size="14" text-anchor="middle" fill="#888">Pages: ${pageCount}</text>
        <text x="50%" y="250" font-family="Arial" font-size="14" text-anchor="middle" fill="#888">Format: ${outputFormat.toUpperCase()}</text>
        <text x="50%" y="${height-50}" font-family="Arial" font-size="12" text-anchor="middle" fill="#999">This is a placeholder image</text>
      </svg>
    `;
    
    // Convert SVG to the target image format
    let sharpInstance = sharp(Buffer.from(svg));
    
    // Apply quality options if provided
    const quality = options.quality || 80;
    
    // Convert to the target format
    switch (outputFormat.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png();
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'tiff':
        sharpInstance = sharpInstance.tiff();
        break;
      default:
        throw new Error(`Unsupported output image format: ${outputFormat}`);
    }
    
    return await sharpInstance.toBuffer();
  } catch (error) {
    throw new Error(`PDF to image conversion failed: ${error.message}`);
  }
}

/**
 * Convert image formats
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} inputFormat - Input format
 * @param {string} outputFormat - Output format
 * @param {Object} options - Conversion options
 * @returns {Buffer} Converted image buffer
 */
async function convertImage(imageBuffer, inputFormat, outputFormat, options) {
  try {
    // Validate image formats
    const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'tiff'];
    if (!imageFormats.includes(inputFormat) || !imageFormats.includes(outputFormat)) {
      throw new Error(`Unsupported image format conversion: ${inputFormat} to ${outputFormat}`);
    }
    
    // Use sharp for image conversion
    let sharpInstance = sharp(imageBuffer);
    
    // Apply quality options if provided
    const quality = options.quality || 80;
    
    // Convert to the target format
    switch (outputFormat.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png();
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'tiff':
        sharpInstance = sharpInstance.tiff();
        break;
      default:
        throw new Error(`Unsupported output image format: ${outputFormat}`);
    }
    
    return await sharpInstance.toBuffer();
  } catch (error) {
    throw new Error(`Image conversion failed: ${error.message}`);
  }
}

/**
 * Convert other formats to image
 * @param {Buffer} buffer - Input buffer
 * @param {string} inputFormat - Input format
 * @param {string} outputFormat - Output format
 * @param {Object} options - Conversion options
 * @returns {Buffer} Converted image buffer
 */
async function convertToImage(buffer, inputFormat, outputFormat, options) {
  try {
    // Extract text content from the document
    let textContent = '';
    
    switch (inputFormat) {
      case 'txt':
      case 'csv':
      case 'json':
      case 'xml':
      case 'html':
      case 'md':
        textContent = buffer.toString('utf8');
        break;
      default:
        // For other formats, try to extract text
        textContent = buffer.toString('utf8');
    }
    
    // Create an image with the text content
    // This is a simplified approach - in a real implementation you would
    // render the text to an image with proper formatting
    
    // Create a simple image with text using sharp
    const lines = textContent.split('\n').slice(0, 50); // Limit to 50 lines
    const fontSize = 16;
    const lineHeight = fontSize * 1.5;
    const width = 800;
    const height = Math.max(600, lines.length * lineHeight + 100);
    
    // Create SVG with the text
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="20" y="40" font-family="Arial" font-size="${fontSize}" fill="black">
          ${lines.map((line, i) => 
            `<tspan x="20" y="${40 + i * lineHeight}">${line.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}</tspan>`
          ).join('')}
        </text>
      </svg>
    `;
    
    // Convert SVG to the target image format
    let sharpInstance = sharp(Buffer.from(svg));
    
    // Apply quality options if provided
    const quality = options.quality || 80;
    
    // Convert to the target format
    switch (outputFormat.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png();
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'tiff':
        sharpInstance = sharpInstance.tiff();
        break;
      default:
        throw new Error(`Unsupported output image format: ${outputFormat}`);
    }
    
    return await sharpInstance.toBuffer();
  } catch (error) {
    throw new Error(`Conversion to image failed: ${error.message}`);
  }
}

// Export supported formats
export { SUPPORTED_INPUT_FORMATS, SUPPORTED_OUTPUT_FORMATS };