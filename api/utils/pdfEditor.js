import { PDFDocument, rgb, StandardFonts, degrees, PDFName, PDFDict, PDFHexString } from 'pdf-lib';
import { createCanvas, loadImage } from 'canvas';
import Tesseract from 'tesseract.js';
import pdfPoppler from 'pdf-poppler';
const { PdfConverter } = pdfPoppler;
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import PDFDoc from 'pdfkit';

// Converte URL do módulo para caminho real
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rotate PDF pages
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} rotations - Array of {page: number, degrees: number}
 * @returns {Buffer} Rotated PDF buffer
 */
async function rotatePages(pdfBuffer, rotations) {
  console.log('rotatePages called with:', rotations);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  console.log('PDF loaded, page count:', pdfDoc.getPageCount());

  for (const rotation of rotations) {
    console.log('Rotating page:', rotation.page, 'degrees:', rotation.degrees);
    const pageIndex = rotation.page - 1; // 0-indexed
    console.log('Page index:', pageIndex);
    
    // Check if page index is valid
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
      throw new Error(`Página inválida: ${rotation.page}. O PDF tem ${pdfDoc.getPageCount()} páginas.`);
    }
    
    const page = pdfDoc.getPage(pageIndex);
    page.setRotation(degrees(rotation.degrees));  // Usa degrees() para rotacionar
    console.log('Page rotated');
  }

  console.log('Saving PDF');
  const result = await pdfDoc.save();
  console.log('PDF saved');
  return result;
}

/**
 * Split PDF into multiple parts
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} splitPoints - Array of page numbers where to split
 * @returns {Array} Array of PDF buffers
 */
async function splitPdf(pdfBuffer, splitPoints) {
  console.log('splitPdf called with:', splitPoints);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  console.log('PDF loaded, page count:', pdfDoc.getPageCount());
  const result = [];

  let startIndex = 0;
  for (const splitPoint of splitPoints) {
    console.log('Processing split point:', splitPoint);
    const newDoc = await PDFDocument.create();
    console.log('New PDF created for split');

    // Validate split point
    if (splitPoint <= startIndex || splitPoint > pdfDoc.getPageCount()) {
      throw new Error(`Ponto de divisão inválido: ${splitPoint}. Deve ser maior que ${startIndex} e menor ou igual a ${pdfDoc.getPageCount()}.`);
    }

    for (let i = startIndex; i < splitPoint; i++) {
      console.log('Copying page:', i);
      const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(copiedPage);
    }

    console.log('Saving split PDF part');
    const savedPdf = await newDoc.save();
    // Ensure we return a Buffer object, not Uint8Array
    const buffer = Buffer.from(savedPdf);
    result.push(buffer);
    console.log('Split PDF part saved');
    startIndex = splitPoint;
  }

  // Pega páginas restantes depois do último split
  if (startIndex < pdfDoc.getPageCount()) {
    console.log('Processing remaining pages from index:', startIndex);
    const newDoc = await PDFDocument.create();
    for (let i = startIndex; i < pdfDoc.getPageCount(); i++) {
      console.log('Copying remaining page:', i);
      const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(copiedPage);
    }
    console.log('Saving final PDF part');
    const savedPdf = await newDoc.save();
    // Ensure we return a Buffer object, not Uint8Array
    const buffer = Buffer.from(savedPdf);
    result.push(buffer);
    console.log('Final PDF part saved');
  }

  console.log('Split operation completed, parts count:', result.length);
  return result;
}

/**
 * Extract specific pages from PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} pageNumbers - Array of page numbers to extract
 * @returns {Buffer} PDF buffer with extracted pages
 */
async function extractPages(pdfBuffer, pageNumbers) {
  console.log('extractPages called with:', pageNumbers);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  console.log('PDF loaded, page count:', pdfDoc.getPageCount());
  const newDoc = await PDFDocument.create();
  console.log('New PDF created');

  for (const pageNum of pageNumbers) {
    console.log('Extracting page:', pageNum);
    const pageIndex = pageNum - 1; // 0-indexed
    console.log('Page index:', pageIndex);
    
    // Check if page index is valid
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
      throw new Error(`Página inválida: ${pageNum}. O PDF tem ${pdfDoc.getPageCount()} páginas.`);
    }
    
    const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageIndex]);
    newDoc.addPage(copiedPage);
    console.log('Page extracted');
  }

  console.log('Saving PDF');
  const result = await newDoc.save();
  console.log('PDF saved');
  return result;
}

/**
 * Add watermark to PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} watermarkText - Watermark text
 * @param {Object} options - Watermark options (position, opacity, fontSize, pages, watermarkImageBuffer)
 * @returns {Buffer} PDF buffer with watermark
 */
async function addWatermark(pdfBuffer, watermarkText, options = {}) {
  console.log('addWatermark called with text:', watermarkText, 'and options:', options);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  console.log('PDF loaded, page count:', pdfDoc.getPageCount());

  const {
    opacity = 0.5,
    fontSize = 30,
    position = 'center',
    pages = null, // array de páginas específicas (1-indexed)
    watermarkImageBuffer = null,
    page: specificPage = null, // número de página específico (1-indexed)
    imageWidth = 150,
    imageHeight = 150
  } = options;

  console.log('Watermark options processed');

  // Se houver imagem para marca d'água, carrega a imagem
  let watermarkImage = null;
  if (watermarkImageBuffer) {
    console.log('Loading watermark image');
    try {
      watermarkImage = await pdfDoc.embedPng(watermarkImageBuffer);
      console.log('PNG watermark image loaded');
    } catch (pngError) {
      console.log('Failed to load PNG watermark image, trying JPG:', pngError.message);
      try {
        watermarkImage = await pdfDoc.embedJpg(watermarkImageBuffer);
        console.log('JPG watermark image loaded');
      } catch (jpegError) {
        console.error('Erro ao carregar imagem da marca d\'água:', jpegError);
      }
    }
  }

  // Determina quais páginas receberão a marca d'água
  let pagesToMark = [];

  if (specificPage !== undefined && specificPage !== null) {
    console.log('Adding watermark to specific page:', specificPage);
    const idx = specificPage - 1;
    if (idx < 0 || idx >= pdfDoc.getPageCount()) {
      throw new Error(`Página inválida: ${specificPage}`);
    }
    pagesToMark = [pdfDoc.getPage(idx)];
  }
  else if (Array.isArray(pages) && pages.length > 0) {
    console.log('Adding watermark to specific pages:', pages);
    for (const p of pages) {
      const idx = p - 1;
      if (idx < 0 || idx >= pdfDoc.getPageCount()) {
        throw new Error(`Página inválida: ${p}`);
      }
      pagesToMark.push(pdfDoc.getPage(idx));
    }
  }
  else {
    console.log('Adding watermark to all pages');
    pagesToMark = pdfDoc.getPages();
  }

  console.log('Pages to mark:', pagesToMark.length);

  // Adiciona marca d'água
  for (const page of pagesToMark) {
    const { width, height } = page.getSize();
    console.log('Processing page with dimensions:', width, 'x', height);

    // Marca d'água de imagem
    if (watermarkImage) {
      console.log('Adding image watermark');
      let x, y;
      switch (position) {
        case 'top-left':
          x = 20;
          y = height - imageHeight - 20;
          break;
        case 'top-right':
          x = width - imageWidth - 20;
          y = height - imageHeight - 20;
          break;
        case 'bottom-left':
          x = 20;
          y = 20;
          break;
        case 'bottom-right':
          x = width - imageWidth - 20;
          y = 20;
          break;
        case 'center':
        default:
          x = (width - imageWidth) / 2;
          y = (height - imageHeight) / 2;
          break;
      }
      
      page.drawImage(watermarkImage, {
        x,
        y,
        width: imageWidth,
        height: imageHeight,
        opacity
      });
      console.log('Image watermark added');
    }

    // Marca d'água de texto
    if (watermarkText) {
      console.log('Adding text watermark:', watermarkText);
      let x, y;
      switch (position) {
        case 'top-left':
          x = 20;
          y = height - fontSize - 20;
          break;
        case 'top-right':
          x = width - (watermarkText.length * (fontSize * 0.5)) - 20;
          y = height - fontSize - 20;
          break;
        case 'bottom-left':
          x = 20;
          y = 20;
          break;
        case 'bottom-right':
          x = width - (watermarkText.length * (fontSize * 0.5)) - 20;
          y = 20;
          break;
        case 'center':
        default:
          x = width / 2 - (watermarkText.length * (fontSize * 0.25));
          y = height / 2;
          break;
      }
      
      page.drawText(watermarkText, {
        x,
        y,
        size: fontSize,
        opacity,
        color: rgb(0, 0, 0),
        rotate: degrees(0)
      });
      console.log('Text watermark added');
    }
  }

  console.log('Saving PDF');
  const result = await pdfDoc.save();
  console.log('PDF saved');
  return result;
}

/**
 * Remove specific pages from PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} pagesToRemove - Array of page numbers to remove (1-indexed)
 * @returns {Buffer} PDF buffer with pages removed
 */
async function removePages(pdfBuffer, pagesToRemove) {
  console.log('removePages called with:', pagesToRemove);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  console.log('PDF loaded, page count:', pdfDoc.getPageCount());
  
  // Converte para índices 0-based e ordena em ordem decrescente
  // para remover da última para a primeira (evita problemas de indexação)
  const indicesToRemove = pagesToRemove
    .map(pageNum => {
      const index = pageNum - 1; // Converte para 0-based
      console.log('Converting page number', pageNum, 'to index', index);
      return index;
    })
    .sort((a, b) => b - a); // Ordena decrescente
  
  console.log('Indices to remove:', indicesToRemove);
  
  // Check if any index is out of range
  const pageCount = pdfDoc.getPageCount();
  for (const index of indicesToRemove) {
    if (index < 0 || index >= pageCount) {
      const pageNum = index + 1; // Convert back to 1-indexed for error message
      throw new Error(`Página inválida: ${pageNum}. O PDF tem ${pageCount} páginas.`);
    }
  }
  
  // Remove as páginas
  for (const index of indicesToRemove) {
    console.log('Removing page at index:', index);
    pdfDoc.removePage(index);
    console.log('Page removed, new page count:', pdfDoc.getPageCount());
  }
  
  console.log('Saving PDF');
  const result = await pdfDoc.save();
  console.log('PDF saved');
  return result;
}

/**
 * Converte uma página de PDF para imagem usando pdf-lib + canvas
 * @param {PDFDocument} pdfDoc 
 * @param {number} pageNumber - índice da página (0 baseado)
 */
async function pdfPageToImageBuffer(pdfDoc, pageNumber) {
  const page = pdfDoc.getPage(pageNumber);
  const { width, height } = page.getSize();

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Renderiza fundo branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // OBS: pdf-lib não renderiza conteúdo visual, então OCR funcionará
  // apenas se PDF for imagem. Para PDFs de texto real, Tesseract não é necessário.
  // Aqui estamos apenas simulando OCR via canvas para PDFs de imagem.

  return canvas.toBuffer();
}

/**
 * Substitui texto automaticamente usando OCR para localizar
 * @param {Uint8Array|Buffer} pdfBuffer - PDF original
 * @param {Array} edits - [{ page: number, search: string, replace: string, size?: number, color?: string }]
 */
export async function editTextAuto(pdfBuffer, edits) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  for (const edit of edits) {
    const pageIndex = edit.page - 1;

    // Converte página em imagem
    const pageImageBuffer = await pdfPageToImageBuffer(pdfDoc, pageIndex);

    // Executa OCR
    const { data: { words } } = await Tesseract.recognize(pageImageBuffer, 'por');

    const page = pdfDoc.getPage(pageIndex);

    for (const word of words) {
      if (word.text === edit.search) {
        // Apaga texto antigo
        page.drawRectangle({
          x: word.bbox.x0,
          y: page.getHeight() - word.bbox.y1,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
          color: rgb(1, 1, 1),
        });

        // Escreve o novo texto
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        page.drawText(edit.replace, {
          x: word.bbox.x0,
          y: page.getHeight() - word.bbox.y1,
          size: edit.size || 12,
          font,
          color: edit.color
            ? rgb(...hexToRgb(edit.color))
            : rgb(0, 0, 0),
        });
      }
    }
  }

  return await pdfDoc.save();
}

/**
 * Converte cor hexadecimal para array RGB 0-1
 * @param {string} hex - ex: "#FF0000"
 */
function hexToRgb(hex) {
  const match = hex.replace('#', '').match(/.{1,2}/g);
  if (!match) return [0, 0, 0];
  return match.map(x => parseInt(x, 16) / 255);
}

/**
 * Add digital signature to PDF (placeholder implementation)
 * Note: pdf-lib doesn't currently support creating digital signatures
 * This is a placeholder for future implementation
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Object} options - Signature options
 * @returns {Buffer} PDF buffer with signature field
 */
async function addDigitalSignature(pdfBuffer, options = {}) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  
  // Note: This is a simplified implementation
  // In a real implementation, you would need to:
  // 1. Create a signature field
  // 2. Add it to a page
  // 3. Create appearance for the signature
  // 4. Actually sign the document with a certificate
  
  // For now, we'll just return the document as-is
  // A real implementation would require additional libraries for cryptographic signing
  console.warn('Digital signature implementation is a placeholder. Actual signing requires cryptographic libraries.');
  
  return await pdfDoc.save();
}

/**
 * Add highlight annotation to PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} highlights - Array of {page: number, x: number, y: number, width: number, height: number}
 * @returns {Buffer} PDF buffer with highlights
 */
async function addHighlightAnnotations(pdfBuffer, highlights) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  
  // Note: pdf-lib doesn't have built-in support for highlight annotations
  // This is a simplified implementation that draws rectangles
  // A full implementation would require creating proper annotation objects
  
  for (const highlight of highlights) {
    const page = pdfDoc.getPage(highlight.page - 1);
    
    // Draw a semi-transparent yellow rectangle to simulate highlight
    page.drawRectangle({
      x: highlight.x,
      y: highlight.y,
      width: highlight.width,
      height: highlight.height,
      color: rgb(1, 1, 0), // Yellow
      opacity: 0.5,
    });
  }
  
  return await pdfDoc.save();
}

/**
 * Adiciona comentários anotados ao PDF
 * @param {Buffer} pdfBuffer - Buffer do PDF
 * @param {Array} comments - Array de objetos {page, x, y, content, textColor, bgColor, fontSize}
 * @returns {Buffer} - PDF modificado como Buffer
 */
export async function addCommentAnnotations(pdfBuffer, comments) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const comment of comments) {
    const pageIndex = comment.page - 1;
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
      throw new Error(`Página inválida: ${comment.page}`);
    }

    const page = pdfDoc.getPage(pageIndex);

    const textColor = comment.textColor
      ? rgb(comment.textColor[0], comment.textColor[1], comment.textColor[2])
      : rgb(0, 0, 0);
    const bgColor = comment.bgColor
      ? rgb(comment.bgColor[0], comment.bgColor[1], comment.bgColor[2])
      : rgb(1, 1, 0);

    const fontSize = comment.fontSize || 12;
    const padding = 4;
    const width = comment.width || 200;
    const height = comment.height || 50;

    page.drawRectangle({
      x: comment.x - padding,
      y: comment.y - padding,
      width,
      height,
      color: bgColor,
      opacity: 0.7,
    });

    page.drawText(comment.content, {
      x: comment.x,
      y: comment.y,
      size: fontSize,
      font: helveticaFont,
      color: textColor,
      maxWidth: width - padding * 2,
    });
  }

  return await pdfDoc.save();
}

/**
 * Create PDF from images
 * @param {Array} imageBuffers - Array of image buffers
 * @param {Object} options - PDF options (width, height, margin)
 * @returns {Buffer} PDF buffer
 */
async function createPdfFromImages(imageBuffers, options = {}) {
  const {
    width = 600,
    height = 800,
    margin = 20
  } = options;

  const pdfDoc = await PDFDocument.create();

  for (const imageBuffer of imageBuffers) {
    try {
      // Try to embed as PNG first
      let image;
      try {
        image = await pdfDoc.embedPng(imageBuffer);
      } catch {
        // If PNG fails, try JPG
        try {
          image = await pdfDoc.embedJpg(imageBuffer);
        } catch (jpegError) {
          console.error('Erro ao carregar imagem:', jpegError);
          continue;
        }
      }

      // Create a new page
      const page = pdfDoc.addPage([width, height]);
      
      // Calculate image dimensions to fit the page
      const imageDims = image.scaleToFit(width - 2 * margin, height - 2 * margin);
      
      // Draw the image centered on the page
      page.drawImage(image, {
        x: margin,
        y: height - margin - imageDims.height,
        width: imageDims.width,
        height: imageDims.height,
      });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
    }
  }

  return await pdfDoc.save();
}

/**
 * Create PDF from text content
 * @param {string} text - Text content
 * @param {Object} options - PDF options (title, pageSize, fontSize)
 * @returns {Buffer} PDF buffer
 */

export async function createPdfFromText(text, options = {}) {
  const {
    title = 'Documento PDF',
    pageSize = 'A4',
    fontSize = 12
  } = options;

  // Definição dos tamanhos de página em pontos
  const pageSizes = {
    'A4': [595.28, 841.89],
    'A3': [841.89, 1190.55],
    'Letter': [612, 792],
    'Legal': [612, 1008]
  };

  const [width, height] = pageSizes[pageSize] || pageSizes['A4'];

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([width, height]);

  // Fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Título
  page.drawText(title, {
    x: 50,
    y: height - 50,
    size: 18,
    font: titleFont,
    color: rgb(0, 0, 0),
  });

  // Conteúdo
  const content = text || 'Documento gerado sem conteúdo.';
  const lines = content.split('\n');
  let yPosition = height - 100;

  for (const line of lines) {
    // Verifica se precisa de nova página
    if (yPosition < 50) {
      page = pdfDoc.addPage([width, height]); // agora substitui a página
      yPosition = height - 50;
    }

    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: parseInt(fontSize),
      font: font,
      color: rgb(0, 0, 0),
    });

    yPosition -= parseInt(fontSize) + 5;
  }

  return await pdfDoc.save();
}

/**
 * Create PDF from table data
 * @param {Array} tableData - 2D array of table data
 * @param {Array} tableHeaders - Array of table headers
 * @param {Object} options - PDF options (title, pageSize)
 * @returns {Buffer} PDF buffer
 */
async function createPdfFromTable(tableData, tableHeaders, options = {}) {
  const {
    title = 'Tabela PDF',
    pageSize = 'A4'
  } = options;

  const pageSizes = {
    'A4': [595.28, 841.89],
    'A3': [841.89, 1190.55],
    'Letter': [612, 792],
    'Legal': [612, 1008]
  };

  const [width, height] = pageSizes[pageSize] || pageSizes['A4'];
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headerFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add title
  page.drawText(title, {
    x: 50,
    y: height - 50,
    size: 18,
    font: titleFont,
    color: rgb(0, 0, 0),
  });
  
  // Draw table
  const startX = 50;
  let startY = height - 100;
  const rowHeight = 20;
  const cellPadding = 5;
  
  // Calculate column widths
  const numCols = tableHeaders.length > 0 ? tableHeaders.length : (tableData.length > 0 ? tableData[0].length : 1);
  const tableWidth = width - 100;
  const colWidth = tableWidth / numCols;
  
  // Draw headers
  if (tableHeaders.length > 0) {
    for (let i = 0; i < tableHeaders.length; i++) {
      const cellX = startX + i * colWidth;
      
      // Draw header cell background
      page.drawRectangle({
        x: cellX,
        y: startY,
        width: colWidth,
        height: rowHeight,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Draw header text
      page.drawText(tableHeaders[i], {
        x: cellX + cellPadding,
        y: startY + 5,
        size: 10,
        font: headerFont,
        color: rgb(0, 0, 0),
      });
    }
    startY -= rowHeight;
  }
  
  // Draw table data
  for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
    const row = tableData[rowIndex];
    
    // Check if we need a new page
    if (startY < 50) {
      const newPage = pdfDoc.addPage([width, height]);
      startY = height - 50;
    }
    
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellX = startX + colIndex * colWidth;
      const cellValue = row[colIndex] || '';
      
      // Draw cell border
      page.drawRectangle({
        x: cellX,
        y: startY,
        width: colWidth,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      
      // Draw cell text
      page.drawText(cellValue, {
        x: cellX + cellPadding,
        y: startY + 5,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
    
    startY -= rowHeight;
  }
  
  return await pdfDoc.save();
}

/**
 * Create PDF from multiple content types (text, images, tables)
 * @param {Array} contentItems - Array of content items [{type, content, imageBuffer, tableData, tableHeaders}]
 * @param {Object} options - PDF options (title, pageSize, fontSize)
 * @returns {Buffer} PDF buffer
 */
async function createPdfFromMultipleContent(contentItems, options = {}) {
  const {
    title = '',
    pageSize = 'A4',
    fontSize = 12
  } = options;

  const pageSizes = {
    'A4': [595.28, 841.89],
    'A3': [841.89, 1190.55],
    'Letter': [612, 792],
    'Legal': [612, 1008]
  };

  const [width, height] = pageSizes[pageSize] || pageSizes['A4'];
  
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([width, height]);
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headerFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let yPosition = height - 50;
  
  // Add title if provided
  if (title) {
    currentPage.drawText(title, {
      x: 50,
      y: yPosition,
      size: 18,
      font: titleFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;
  }
  
  // Process each content item
  for (const item of contentItems) {
    // Check if we need a new page
    if (yPosition < 100) {
      currentPage = pdfDoc.addPage([width, height]);
      yPosition = height - 50;
    }
    
    switch (item.type) {
      case 'text':
        // Add text content
        const lines = (item.content || '').split('\n');
        for (const line of lines) {
          // Check if we need a new page
          if (yPosition < 50) {
            currentPage = pdfDoc.addPage([width, height]);
            yPosition = height - 50;
          }
          
          currentPage.drawText(line, {
            x: 50,
            y: yPosition,
            size: parseInt(fontSize),
            font: font,
            color: rgb(0, 0, 0),
          });
          
          yPosition -= parseInt(fontSize) + 5;
        }
        yPosition -= 10; // Add some space after text
        break;
        
      case 'image':
        // Add image content
        if (item.imageBuffer) {
          try {
            let image;
            try {
              image = await pdfDoc.embedPng(item.imageBuffer);
            } catch {
              try {
                image = await pdfDoc.embedJpg(item.imageBuffer);
              } catch (jpegError) {
                console.error('Erro ao carregar imagem:', jpegError);
                break;
              }
            }
            
            // Check if we need a new page
            if (yPosition < 200) {
              currentPage = pdfDoc.addPage([width, height]);
              yPosition = height - 50;
            }
            
            // Calculate image dimensions to fit the page
            const margin = 50;
            const maxWidth = width - 2 * margin;
            const maxHeight = yPosition - 100;
            const imageDims = image.scaleToFit(maxWidth, maxHeight);
            
            // Draw the image
            currentPage.drawImage(image, {
              x: (width - imageDims.width) / 2,
              y: yPosition - imageDims.height,
              width: imageDims.width,
              height: imageDims.height,
            });
            
            yPosition -= imageDims.height + 20;
          } catch (error) {
            console.error('Erro ao processar imagem:', error);
          }
        }
        break;
        
      case 'table':
        // Add table content
        if (item.tableData && item.tableData.length > 0) {
          const startX = 50;
          let tableYPosition = yPosition;
          const rowHeight = 20;
          const cellPadding = 5;
          
          // Calculate column widths
          const numCols = item.tableHeaders.length > 0 ? item.tableHeaders.length : (item.tableData.length > 0 ? item.tableData[0].length : 1);
          const tableWidth = width - 100;
          const colWidth = tableWidth / numCols;
          
          // Check if table fits on current page
          const tableHeight = (item.tableHeaders.length > 0 ? 1 : 0 + item.tableData.length) * rowHeight + 20;
          if (tableYPosition - tableHeight < 50) {
            currentPage = pdfDoc.addPage([width, height]);
            tableYPosition = height - 50;
          }
          
          // Draw headers
          if (item.tableHeaders.length > 0) {
            for (let i = 0; i < item.tableHeaders.length; i++) {
              const cellX = startX + i * colWidth;
              
              // Draw header cell background
              currentPage.drawRectangle({
                x: cellX,
                y: tableYPosition - rowHeight,
                width: colWidth,
                height: rowHeight,
                color: rgb(0.8, 0.8, 0.8),
              });
              
              // Draw header text
              currentPage.drawText(item.tableHeaders[i], {
                x: cellX + cellPadding,
                y: tableYPosition - rowHeight + 5,
                size: 10,
                font: headerFont,
                color: rgb(0, 0, 0),
              });
            }
            tableYPosition -= rowHeight;
          }
          
          // Draw table data
          for (let rowIndex = 0; rowIndex < item.tableData.length; rowIndex++) {
            const row = item.tableData[rowIndex];
            
            // Check if we need a new page
            if (tableYPosition - rowHeight < 50) {
              currentPage = pdfDoc.addPage([width, height]);
              tableYPosition = height - 50;
            }
            
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
              const cellX = startX + colIndex * colWidth;
              const cellValue = row[colIndex] || '';
              
              // Draw cell border
              currentPage.drawRectangle({
                x: cellX,
                y: tableYPosition - rowHeight,
                width: colWidth,
                height: rowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
              });
              
              // Draw cell text
              currentPage.drawText(cellValue, {
                x: cellX + cellPadding,
                y: tableYPosition - rowHeight + 5,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
            
            tableYPosition -= rowHeight;
          }
          
          yPosition = tableYPosition - 20;
        }
        break;
    }
  }
  
  return await pdfDoc.save();
}

/**
 * Attempt to recover a corrupted PDF
 * @param {Buffer} pdfBuffer - Corrupted PDF buffer
 * @returns {Buffer} Recovered PDF buffer
 */
async function recoverPdf(pdfBuffer) {
  try {
    // Try to load the PDF normally first
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      return await pdfDoc.save();
    } catch (normalError) {
      // If normal loading fails, try with ignoreEncryption
      try {
        const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
        return await pdfDoc.save();
      } catch (ignoreEncryptionError) {
        // If that also fails, try to create a new PDF and copy pages
        try {
          const sourceDoc = await PDFDocument.load(pdfBuffer, {
            ignoreEncryption: true,
            parseSpeed: 0 // 0 is fastest, 1 is medium, 2 is slow
          });
          
          const newDoc = await PDFDocument.create();
          
          // Try to copy pages one by one
          const pageCount = sourceDoc.getPageCount();
          for (let i = 0; i < pageCount; i++) {
            try {
              const [copiedPage] = await newDoc.copyPages(sourceDoc, [i]);
              newDoc.addPage(copiedPage);
            } catch (pageError) {
              console.warn(`Falha ao copiar página ${i + 1}:`, pageError.message);
              // Continue with other pages
            }
          }
          
          return await newDoc.save();
        } catch (recoveryError) {
          throw new Error('Falha ao recuperar o PDF. O arquivo pode estar muito corrompido.');
        }
      }
    }
  } catch (error) {
    throw new Error(`Erro na recuperação do PDF: ${error.message}`);
  }
}

/**
 * Attempt to recover corrupted documents (Word, Excel, etc.)
 * @param {Buffer} fileBuffer - Corrupted file buffer
 * @param {string} fileType - Type of file (docx, xlsx, etc.)
 * @returns {Buffer} Recovered file buffer
 */
async function recoverDocument(fileBuffer, fileType) {
  try {
    // For now, we'll implement a basic recovery approach
    // In a real implementation, you would use specific libraries for each file type
    
    switch (fileType.toLowerCase()) {
      case 'pdf':
        // For PDF files, implement the three-step recovery process
        console.log('Recovering PDF file with improved flow');
        
        // First attempt: Try to open with pdf-lib and save again
        try {
          console.log('First attempt: pdf-lib recovery');
          const pdfDoc = await PDFDocument.load(fileBuffer);
          return await pdfDoc.save();
        } catch (pdfLibError) {
          console.error('First attempt failed:', pdfLibError.message);
          
          // Second attempt: Use pdf-parse to extract text
          try {
            console.log('Second attempt: pdf-parse text extraction');
            // Pass the file buffer directly to pdf-parse
            const pdfParseResult = await pdfParse(fileBuffer);
            const extractedText = pdfParseResult.text;
            
            if (extractedText && extractedText.trim() !== '') {
              // Create a new PDF with the extracted text using pdfkit
              console.log('Creating new PDF with extracted text');
              const doc = new PDFDoc();
              const chunks = [];
              
              // Collect data chunks
              doc.on('data', chunk => chunks.push(chunk));
              
              // Add the extracted text to the PDF
              doc.fontSize(12);
              doc.text(extractedText, 50, 50);
              doc.end();
              
              // Wait for the PDF to be generated
              const pdfBuffer = await new Promise((resolve, reject) => {
                doc.on('end', () => {
                  const pdfBuffer = Buffer.concat(chunks);
                  resolve(pdfBuffer);
                });
                doc.on('error', reject);
              });
              
              return pdfBuffer;
            }
          } catch (pdfParseError) {
            console.error('Second attempt failed:', pdfParseError.message);
            
            // Third attempt: Run OCR with Tesseract.js
            try {
              console.log('Third attempt: OCR with Tesseract.js');
              // Try to convert PDF to images and run OCR
              const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
              const pageCount = pdfDoc.getPageCount();
              let ocrText = '';
              
              for (let i = 0; i < pageCount; i++) {
                try {
                  // Convert page to image buffer
                  const pageImageBuffer = await pdfPageToImageBuffer(pdfDoc, i);
                  
                  // Run OCR on the image
                  const { data: { text } } = await Tesseract.recognize(pageImageBuffer, 'por', {
                    logger: info => console.log(`OCR progress for page ${i + 1}:`, info)
                  });
                  
                  ocrText += `Página ${i + 1}\n`;
                  ocrText += text + '\n\n';
                } catch (pageError) {
                  console.warn(`Failed to process page ${i + 1} with OCR:`, pageError.message);
                }
              }
              
              if (ocrText && ocrText.trim() !== '') {
                // Create a new PDF with the OCR text using pdfkit
                console.log('Creating new PDF with OCR text');
                const doc = new PDFDoc();
                const chunks = [];
                
                // Collect data chunks
                doc.on('data', chunk => chunks.push(chunk));
                
                // Add the OCR text to the PDF
                doc.fontSize(12);
                doc.text(ocrText, 50, 50);
                doc.end();
                
                // Wait for the PDF to be generated
                const pdfBuffer = await new Promise((resolve, reject) => {
                  doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    resolve(pdfBuffer);
                  });
                  doc.on('error', reject);
                });
                
                return pdfBuffer;
              }
            } catch (ocrError) {
              console.error('Third attempt failed:', ocrError.message);
            }
          }
        }
        
        // If all attempts fail, return the original file buffer
        console.log('All recovery attempts failed, returning original file');
        return fileBuffer;
        
      case 'docx':
        // For Word documents, we can try to repair the XML structure
        // This is a simplified implementation
        console.log('Recovering DOCX file');
        // In a real implementation, you would use a library like mammoth or similar
        // to parse and repair the document structure
        // For now, we'll try to extract text content
        try {
          // Try to extract text from DOCX (simplified approach)
          const textContent = fileBuffer.toString('utf8');
          // Look for text content in the DOCX file
          const textMatch = textContent.match(/<w:t[^>]*>(.*?)<\/w:t>/gs);
          if (textMatch) {
            const extractedText = textMatch.map(match => {
              // Remove XML tags and decode entities
              return match.replace(/<[^>]+>/g, '')
                .replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/&/g, '&')
                .replace(/"/g, '"')
                .replace(/'/g, "'");
            }).join('\n\n');
            
            return Buffer.from(extractedText, 'utf8');
          }
        } catch (docxError) {
          console.error('Erro ao extrair texto do DOCX:', docxError.message);
        }
        return fileBuffer;
        
      case 'xlsx':
        // For Excel documents, we can try to repair the XML structure
        console.log('Recovering XLSX file');
        // In a real implementation, you would use a library like xlsx or similar
        // to parse and repair the document structure
        // For now, we'll try to extract text content
        try {
          // Try to extract text from XLSX (simplified approach)
          const textContent = fileBuffer.toString('utf8');
          // Look for text content in the XLSX file
          const cellMatches = textContent.match(/<c[^>]*><v[^>]*>(.*?)<\/v><\/c>/g);
          if (cellMatches) {
            const extractedText = cellMatches.map(match => {
              // Extract cell values
              const valueMatch = match.match(/<v[^>]*>(.*?)<\/v>/);
              return valueMatch ? valueMatch[1] : '';
            }).join('\n');
            
            return Buffer.from(extractedText, 'utf8');
          }
        } catch (xlsxError) {
          console.error('Erro ao extrair texto do XLSX:', xlsxError.message);
        }
        return fileBuffer;
        
      case 'pptx':
        // For PowerPoint documents, we can try to repair the XML structure
        console.log('Recovering PPTX file');
        // In a real implementation, you would use a library like pptx or similar
        // to parse and repair the document structure
        // For now, we'll try to extract text content
        try {
          // Try to extract text from PPTX (simplified approach)
          const textContent = fileBuffer.toString('utf8');
          // Look for text content in the PPTX file
          const textMatches = textContent.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
          if (textMatches) {
            const extractedText = textMatches.map(match => {
              // Remove XML tags and decode entities
              return match.replace(/<[^>]+>/g, '')
                .replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/&/g, '&')
                .replace(/"/g, '"')
                .replace(/'/g, "'");
            }).join('\n\n');
            
            return Buffer.from(extractedText, 'utf8');
          }
        } catch (pptxError) {
          console.error('Erro ao extrair texto do PPTX:', pptxError.message);
        }
        return fileBuffer;
        
      default:
        // For unsupported file types, try to extract text content
        console.log(`Recovery not implemented for file type: ${fileType}`);
        try {
          // Try to extract text content
          const textContent = fileBuffer.toString('utf8');
          return Buffer.from(textContent, 'utf8');
        } catch (textError) {
          console.error('Erro ao extrair texto:', textError.message);
          return fileBuffer;
        }
    }
  } catch (error) {
    throw new Error(`Erro na recuperação do documento ${fileType}: ${error.message}`);
  }
}

export default {
  rotatePages,
  splitPdf,
  extractPages,
  addWatermark,
  editTextAuto,
  removePages,
  addDigitalSignature,
  addHighlightAnnotations,
  addCommentAnnotations,
  createPdfFromImages,
  createPdfFromText,
  createPdfFromTable,
  createPdfFromMultipleContent,
  recoverPdf,
  recoverDocument
};
