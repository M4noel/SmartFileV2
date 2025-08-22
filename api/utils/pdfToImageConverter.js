import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Convert various document types to images
 * @param {Buffer} documentBuffer - Document buffer
 * @param {string} inputFormat - Input format (pdf, docx, pptx, xlsx, txt)
 * @param {string} outputFormat - Output format (jpeg, png, webp)
 * @param {Object} options - Conversion options
 * @returns {Array} Array of image buffers
 */
export default async function documentToImageConverter(documentBuffer, inputFormat = 'pdf', outputFormat = 'jpeg', options = {}) {
  try {
    // Validate input format
    const supportedInputFormats = ['pdf', 'docx', 'pptx', 'xlsx', 'txt', 'rtf'];
    if (!supportedInputFormats.includes(inputFormat.toLowerCase())) {
      throw new Error(`Unsupported input format: ${inputFormat}`);
    }

    // Validate output format
    const supportedOutputFormats = ['jpeg', 'png', 'webp'];
    if (!supportedOutputFormats.includes(outputFormat.toLowerCase())) {
      throw new Error(`Unsupported output format: ${outputFormat}`);
    }

    let pageCount = 1;
    let documentInfo = {};

    // Handle different document types
    switch (inputFormat.toLowerCase()) {
      case 'pdf':
        const pdfDoc = await PDFDocument.load(documentBuffer);
        pageCount = pdfDoc.getPageCount();
        const pages = pdfDoc.getPages();
        documentInfo = {
          type: 'PDF Document',
          pages: pages.map((page, i) => {
            const { width, height } = page.getSize();
            return {
              pageNumber: i + 1,
              width: Math.round(width),
              height: Math.round(height),
              hasContent: true
            };
          })
        };
        break;

      case 'docx':
        pageCount = await estimateDocxPages(documentBuffer);
        documentInfo = {
          type: 'Word Document',
          pages: Array.from({ length: pageCount }, (_, i) => ({
            pageNumber: i + 1,
            width: 1200,
            height: 1600,
            hasContent: true
          }))
        };
        break;

      case 'pptx':
        pageCount = await estimatePptxSlides(documentBuffer);
        documentInfo = {
          type: 'PowerPoint Presentation',
          pages: Array.from({ length: pageCount }, (_, i) => ({
            pageNumber: i + 1,
            width: 1600,
            height: 900, // 16:9 aspect ratio for slides
            hasContent: true
          }))
        };
        break;

      case 'xlsx':
        pageCount = await estimateXlsxSheets(documentBuffer);
        documentInfo = {
          type: 'Excel Spreadsheet',
          pages: Array.from({ length: pageCount }, (_, i) => ({
            pageNumber: i + 1,
            width: 1400,
            height: 1000,
            hasContent: true
          }))
        };
        break;

      case 'txt':
      case 'rtf':
        pageCount = await estimateTextPages(documentBuffer);
        documentInfo = {
          type: inputFormat.toUpperCase() === 'TXT' ? 'Text Document' : 'Rich Text Document',
          pages: Array.from({ length: pageCount }, (_, i) => ({
            pageNumber: i + 1,
            width: 1200,
            height: 1600,
            hasContent: true
          }))
        };
        break;

      default:
        throw new Error(`Unsupported document type: ${inputFormat}`);
    }

    const images = [];

    // Create images for each page/slide/sheet
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const pageData = documentInfo.pages[pageNum - 1];
      const imageBuffer = await createDocumentPageImage(
        pageData, 
        pageCount, 
        inputFormat, 
        outputFormat, 
        documentInfo.type,
        options
      );
      images.push({
        pageNumber: pageNum,
        buffer: imageBuffer
      });
    }

    return images;
  } catch (error) {
    console.error('Document to image conversion error:', error);
    throw new Error(`Document to image conversion failed: ${error.message}`);
  }
}

/**
 * Estimate number of pages in a DOCX document
 */
async function estimateDocxPages(buffer) {
  // Simple estimation based on file size
  const sizeInKB = buffer.length / 1024;
  return Math.max(1, Math.ceil(sizeInKB / 50)); // Rough estimate: 50KB per page
}

/**
 * Estimate number of slides in a PPTX presentation
 */
async function estimatePptxSlides(buffer) {
  // Simple estimation based on file size
  const sizeInKB = buffer.length / 1024;
  return Math.max(1, Math.ceil(sizeInKB / 100)); // Rough estimate: 100KB per slide
}

/**
 * Estimate number of sheets in an XLSX workbook
 */
async function estimateXlsxSheets(buffer) {
  // Simple estimation based on file size
  const sizeInKB = buffer.length / 1024;
  return Math.max(1, Math.ceil(sizeInKB / 200)); // Rough estimate: 200KB per sheet
}

/**
 * Estimate number of pages in a text document
 */
async function estimateTextPages(buffer) {
  const text = buffer.toString('utf8');
  const lines = text.split('\n').length;
  const charsPerLine = 80; // Average characters per line
  const linesPerPage = 50; // Average lines per page
  return Math.max(1, Math.ceil(lines / linesPerPage));
}

/**
 * Create a realistic image representation of a document page
 */
async function createDocumentPageImage(pageData, totalPages, inputFormat, outputFormat, documentType, options = {}) {
  const width = pageData.width || 1200;
  const height = pageData.height || 1600;
  const quality = options.quality || 90;

  // Get appropriate icon and styling based on document type
  const { icon, color, bgColor } = getDocumentTypeInfo(inputFormat);

  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fafafa;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.1"/>
        </filter>
        <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.5" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Page border -->
      <rect x="20" y="20" width="${width-40}" height="${height-40}" 
            fill="white" stroke="#e0e0e0" stroke-width="1" 
            rx="4" filter="url(#shadow)"/>
      
      <!-- Header area -->
      <rect x="40" y="40" width="${width-80}" height="60" 
            fill="${bgColor}" stroke="#e9ecef" stroke-width="1" rx="2"/>
      
      <!-- Main content area -->
      <rect x="40" y="120" width="${width-80}" height="${height-200}" 
            fill="white" stroke="#f0f0f0" stroke-width="1"/>
      
      <!-- Footer area -->
      <rect x="40" y="${height-80}" width="${width-80}" height="40" 
            fill="#f8f9fa" stroke="#e9ecef" stroke-width="1" rx="2"/>
      
      <!-- Header content -->
      <text x="60" y="70" 
            font-family="Arial, sans-serif" font-size="18" 
            fill="#333" font-weight="bold" filter="url(#textShadow)">
        ${documentType} - ${getPageLabel(inputFormat)} ${pageData.pageNumber}
      </text>
      
      <!-- Content lines (simulating text) -->
      <g stroke="#333" stroke-width="1" opacity="0.8">
        ${generateContentLines(width, height, inputFormat)}
      </g>
      
      <!-- Some paragraph blocks -->
      <g fill="#333" opacity="0.7">
        ${generateParagraphs(width, height, inputFormat)}
      </g>
      
      <!-- Page number -->
      <text x="${width/2}" y="${height-50}" 
            font-family="Arial, sans-serif" font-size="14" 
            fill="#666" text-anchor="middle">
        ${pageData.pageNumber} de ${totalPages}
      </text>
      
      <!-- SmartFiles branding -->
      <text x="${width-60}" y="${height-30}" 
            font-family="Arial, sans-serif" font-size="12" 
            fill="#af2de6" text-anchor="end" font-weight="bold">
        SmartFiles
      </text>
      
      <!-- Document type icon in corner -->
      <g transform="translate(${width-80}, 50)">
        ${icon}
      </g>
    </svg>
  `;

  // Convert SVG to the desired format
  const imageBuffer = await sharp(Buffer.from(svgContent))
    .resize(width, height, { 
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toFormat(outputFormat, { 
      quality: quality,
      progressive: outputFormat === 'jpeg'
    })
    .toBuffer();

  return imageBuffer;
}

/**
 * Get document type information
 */
function getDocumentTypeInfo(format) {
  switch (format.toLowerCase()) {
    case 'pdf':
      return {
        icon: `
          <rect width="40" height="50" fill="#e3f2fd" stroke="#2196f3" stroke-width="1" rx="2"/>
          <rect x="30" y="0" width="10" height="10" fill="#2196f3"/>
          <text x="20" y="32" font-family="Arial, sans-serif" font-size="8" 
                fill="#2196f3" text-anchor="middle" font-weight="bold">PDF</text>
        `,
        color: '#2196f3',
        bgColor: '#e3f2fd'
      };
    case 'docx':
      return {
        icon: `
          <rect width="40" height="50" fill="#e8f5e8" stroke="#4caf50" stroke-width="1" rx="2"/>
          <rect x="30" y="0" width="10" height="10" fill="#4caf50"/>
          <text x="20" y="32" font-family="Arial, sans-serif" font-size="8" 
                fill="#4caf50" text-anchor="middle" font-weight="bold">DOC</text>
        `,
        color: '#4caf50',
        bgColor: '#e8f5e8'
      };
    case 'pptx':
      return {
        icon: `
          <rect width="40" height="50" fill="#fff3e0" stroke="#ff9800" stroke-width="1" rx="2"/>
          <rect x="30" y="0" width="10" height="10" fill="#ff9800"/>
          <text x="20" y="32" font-family="Arial, sans-serif" font-size="8" 
                fill="#ff9800" text-anchor="middle" font-weight="bold">PPT</text>
        `,
        color: '#ff9800',
        bgColor: '#fff3e0'
      };
    case 'xlsx':
      return {
        icon: `
          <rect width="40" height="50" fill="#e8f4fd" stroke="#2196f3" stroke-width="1" rx="2"/>
          <rect x="30" y="0" width="10" height="10" fill="#2196f3"/>
          <text x="20" y="32" font-family="Arial, sans-serif" font-size="8" 
                fill="#2196f3" text-anchor="middle" font-weight="bold">XLS</text>
        `,
        color: '#2196f3',
        bgColor: '#e8f4fd'
      };
    case 'txt':
    case 'rtf':
      return {
        icon: `
          <rect width="40" height="50" fill="#f3e5f5" stroke="#9c27b0" stroke-width="1" rx="2"/>
          <rect x="30" y="0" width="10" height="10" fill="#9c27b0"/>
          <text x="20" y="32" font-family="Arial, sans-serif" font-size="8" 
                fill="#9c27b0" text-anchor="middle" font-weight="bold">TXT</text>
        `,
        color: '#9c27b0',
        bgColor: '#f3e5f5'
      };
    default:
      return {
        icon: `
          <rect width="40" height="50" fill="#f5f5f5" stroke="#666" stroke-width="1" rx="2"/>
          <rect x="30" y="0" width="10" height="10" fill="#666"/>
          <text x="20" y="32" font-family="Arial, sans-serif" font-size="8" 
                fill="#666" text-anchor="middle" font-weight="bold">DOC</text>
        `,
        color: '#666',
        bgColor: '#f5f5f5'
      };
  }
}

/**
 * Get appropriate page label for document type
 */
function getPageLabel(format) {
  switch (format.toLowerCase()) {
    case 'pptx': return 'Slide';
    case 'xlsx': return 'Planilha';
    default: return 'Página';
  }
}

/**
 * Generate content lines to simulate text
 */
function generateContentLines(width, height, format) {
  const lines = [];
  const startY = 140;
  const lineHeight = 20;
  const maxLines = Math.floor((height - 240) / lineHeight);
  
  for (let i = 0; i < maxLines; i++) {
    const y = startY + (i * lineHeight);
    const lineLength = 60 + Math.random() * 30; // Random line length
    const x2 = 60 + lineLength;
    
    lines.push(`<line x1="60" y1="${y}" x2="${x2}" y2="${y}"/>`);
  }
  
  return lines.join('\n        ');
}

/**
 * Generate paragraph blocks
 */
function generateParagraphs(width, height, format) {
  const paragraphs = [];
  const startY = 160;
  const blockHeight = 40;
  const maxBlocks = Math.floor((height - 280) / blockHeight);
  
  for (let i = 0; i < maxBlocks; i++) {
    const y = startY + (i * blockHeight);
    const blockWidth = 80 + Math.random() * 20;
    const x2 = 60 + blockWidth;
    
    paragraphs.push(`
        <rect x="60" y="${y}" width="${blockWidth}" height="15" rx="2"/>
        <rect x="60" y="${y+20}" width="${blockWidth * 0.8}" height="12" rx="2"/>
    `);
  }
  
  return paragraphs.join('\n        ');
}