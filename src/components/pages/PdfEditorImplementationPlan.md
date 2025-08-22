# PDF Editor Implementation Plan

## Overview
This document outlines the implementation plan for the basic PDF editor functionality that will allow users to rotate, split, extract pages, and add watermarks to PDFs.

## Backend Implementation

### 1. Dependencies
- pdf-lib (already installed)
- No additional dependencies required

### 2. Utility Functions (server/utils/pdfEditor.js)
```javascript
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

/**
 * Rotate PDF pages
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} rotations - Array of {page: number, degrees: number}
 * @returns {Buffer} Rotated PDF buffer
 */
async function rotatePages(pdfBuffer, rotations) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  
  for (const rotation of rotations) {
    const page = pdfDoc.getPage(rotation.page - 1); // 0-indexed
    page.setRotation(rotation.degrees * Math.PI / 180);
  }
  
  return await pdfDoc.save();
}

/**
 * Split PDF into multiple parts
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} splitPoints - Array of page numbers where to split
 * @returns {Array} Array of PDF buffers
 */
async function splitPdf(pdfBuffer, splitPoints) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const result = [];
  
  // Add full document as first part
  result.push(await pdfDoc.save());
  
  // Split at specified points
  let startIndex = 0;
  for (const splitPoint of splitPoints) {
    const newDoc = await PDFDocument.create();
    
    // Copy pages from startIndex to splitPoint
    for (let i = startIndex; i < splitPoint; i++) {
      const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(copiedPage);
    }
    
    result.push(await newDoc.save());
    startIndex = splitPoint;
  }
  
  return result;
}

/**
 * Extract specific pages from PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} pageNumbers - Array of page numbers to extract
 * @returns {Buffer} PDF buffer with extracted pages
 */
async function extractPages(pdfBuffer, pageNumbers) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const newDoc = await PDFDocument.create();
  
  // Copy specified pages
  for (const pageNum of pageNumbers) {
    const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageNum - 1]);
    newDoc.addPage(copiedPage);
  }
  
  return await newDoc.save();
}

/**
 * Add watermark to PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} watermarkText - Watermark text
 * @param {Object} options - Watermark options (position, opacity, etc.)
 * @returns {Buffer} PDF buffer with watermark
 */
async function addWatermark(pdfBuffer, watermarkText, options = {}) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  
  // TODO: Implement watermarking using pdf-lib
  // This is a simplified example - actual implementation would be more complex
  
  return await pdfDoc.save();
}

module.exports = {
  rotatePages,
  splitPdf,
  extractPages,
  addWatermark
};
```

### 3. Controller Functions (server/controllers/toolsController.js)
```javascript
// Add to existing controller

/**
 * Rotate PDF pages
 */
async rotatePdf(req, res) {
  try {
    const { buffer } = req.file;
    const { rotations } = req.body; // Array of {page, degrees}
    
    const rotatedPdf = await require('../utils/pdfEditor').rotatePages(buffer, JSON.parse(rotations));
    
    res.set('Content-Type', 'application/pdf');
    res.send(rotatedPdf);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao rotacionar PDF' });
  }
}

/**
 * Split PDF
 */
async splitPdf(req, res) {
  try {
    const { buffer } = req.file;
    const { splitPoints } = req.body; // Array of page numbers
    
    const splitPdfs = await require('../utils/pdfEditor').splitPdf(buffer, JSON.parse(splitPoints));
    
    // Return as ZIP file
    const { createReadStream } = require('fs');
    const { createWriteStream } = require('fs');
    const archiver = require('archiver');
    
    const archive = archiver('zip');
    const outputPath = 'temp/split-result.zip';
    
    const output = createWriteStream(outputPath);
    archive.pipe(output);
    
    splitPdfs.forEach((pdfBuffer, index) => {
      archive.append(pdfBuffer, { name: `part-${index + 1}.pdf` });
    });
    
    archive.finalize();
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="pdf-parts.zip"');
    res.sendFile(outputPath);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao dividir PDF' });
  }
}

/**
 * Extract pages from PDF
 */
async extractPages(req, res) {
  try {
    const { buffer } = req.file;
    const { pages } = req.body; // Array of page numbers
    
    const extractedPdf = await require('../utils/pdfEditor').extractPages(buffer, JSON.parse(pages));
    
    res.set('Content-Type', 'application/pdf');
    res.send(extractedPdf);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao extrair páginas' });
  }
}

/**
 * Add watermark to PDF
 */
async addWatermark(req, res) {
  try {
    const { buffer } = req.file;
    const { text, options } = req.body;
    
    const watermarkedPdf = await require('../utils/pdfEditor').addWatermark(
      buffer, 
      text, 
      JSON.parse(options || '{}')
    );
    
    res.set('Content-Type', 'application/pdf');
    res.send(watermarkedPdf);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao adicionar marca d\'água' });
  }
}
```

### 4. API Routes (server/routes/api.js)
```javascript
// Add to existing routes
router.post('/rotate-pdf', upload.single('pdf'), toolsController.rotatePdf);
router.post('/split-pdf', upload.single('pdf'), toolsController.splitPdf);
router.post('/extract-pages', upload.single('pdf'), toolsController.extractPages);
router.post('/add-watermark', upload.single('pdf'), toolsController.addWatermark);
```

## Frontend Implementation

### 1. Vue Component (frontend/client/src/components/pages/PdfEditor.vue)
```vue
<template>
  <div class="pdf-editor-page">
    <h1>✏️ Editor de PDF</h1>
    <p>Rotacione, divida, extraia páginas ou adicione marcas d'água</p>
    
    <FileDrop @file-changed="handleFile" accept="application/pdf" />
    
    <div v-if="file" class="editor-tabs">
      <div class="tab-buttons">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <!-- Rotate Pages Tab -->
      <div v-if="activeTab === 'rotate'" class="tab-content">
        <h3>Rotacionar Páginas</h3>
        <div class="rotation-controls">
          <div v-for="(rotation, index) in rotations" :key="index" class="page-rotation">
            <label>Página {{ index + 1 }}:</label>
            <select v-model="rotation.degrees">
              <option value="0">0°</option>
              <option value="90">90°</option>
              <option value="180">180°</option>
              <option value="270">270°</option>
            </select>
            <button @click="removeRotation(index)">Remover</button>
          </div>
          <button @click="addRotation">Adicionar Página</button>
        </div>
      </div>
      
      <!-- Split PDF Tab -->
      <div v-if="activeTab === 'split'" class="tab-content">
        <h3>Dividir PDF</h3>
        <div class="split-controls">
          <label>Pontos de divisão (números das páginas):</label>
          <input v-model="splitPointsInput" placeholder="Ex: 1, 3, 5">
          <p><small>Separe os números com vírgulas</small></p>
        </div>
      </div>
      
      <!-- Extract Pages Tab -->
      <div v-if="activeTab === 'extract'" class="tab-content">
        <h3>Extrair Páginas</h3>
        <div class="extract-controls">
          <label>Páginas a extrair:</label>
          <input v-model="extractPagesInput" placeholder="Ex: 1, 3, 5-10">
          <p><small>Separe os números com vírgulas, use hífen para intervalos</small></p>
        </div>
      </div>
      
      <!-- Add Watermark Tab -->
      <div v-if="activeTab === 'watermark'" class="tab-content">
        <h3>Adicionar Marca d'Água</h3>
        <div class="watermark-controls">
          <label>Texto da marca d'água:</label>
          <input v-model="watermarkText" placeholder="Digite o texto da marca d'água">
          
          <label>Opacidade:</label>
          <input type="range" v-model="watermarkOpacity" min="0" max="1" step="0.1">
          <span>{{ Math.round(watermarkOpacity * 100) }}%</span>
          
          <label>Posição:</label>
          <select v-model="watermarkPosition">
            <option value="center">Centro</option>
            <option value="top-left">Superior Esquerda</option>
            <option value="top-right">Superior Direita</option>
            <option value="bottom-left">Inferior Esquerda</option>
            <option value="bottom-right">Inferior Direita</option>
          </select>
        </div>
      </div>
    </div>
    
    <button @click="processPdf" :disabled="!file || loading">
      {{ loading ? 'Processando...' : 'Processar PDF' }}
    </button>
    
    <AdBanner v-if="!result" size="300x250" />
    
    <div v-if="result" class="result">
      <h3>✅ PDF processado com sucesso!</h3>
      <a :href="result.url" download="pdf-processado.pdf" class="download-btn">
        Baixar PDF
      </a>
      <div v-if="result.files" class="multiple-files">
        <h4>Arquivos gerados:</h4>
        <ul>
          <li v-for="(file, index) in result.files" :key="index">
            <a :href="file.url" :download="file.name">{{ file.name }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import FileDrop from '@/components/FileDrop.vue';
import AdBanner from '@/components/AdBanner.vue';

const file = ref(null);
const activeTab = ref('rotate');
const loading = ref(false);
const result = ref(null);

// Rotation
const rotations = ref([{ page: 1, degrees: 0 }]);

// Split
const splitPointsInput = ref('');

// Extract
const extractPagesInput = ref('');

// Watermark
const watermarkText = ref('');
const watermarkOpacity = ref(0.5);
const watermarkPosition = ref('center');

const tabs = [
  { id: 'rotate', label: 'Rotacionar' },
  { id: 'split', label: 'Dividir' },
  { id: 'extract', label: 'Extrair' },
  { id: 'watermark', label: 'Marca d\'Água' }
];

const handleFile = (uploadedFile) => {
  file.value = uploadedFile;
  result.value = null;
};

const addRotation = () => {
  rotations.value.push({ page: rotations.value.length + 1, degrees: 0 });
};

const removeRotation = (index) => {
  rotations.value.splice(index, 1);
};

const processPdf = async () => {
  loading.value = true;
  const formData = new FormData();
  formData.append('pdf', file.value);
  
  try {
    let response;
    
    switch (activeTab.value) {
      case 'rotate':
        formData.append('rotations', JSON.stringify(rotations.value));
        response = await axios.post('/api/rotate-pdf', formData, {
          responseType: 'blob'
        });
        break;
        
      case 'split':
        formData.append('splitPoints', JSON.stringify(splitPointsInput.value.split(',').map(Number)));
        response = await axios.post('/api/split-pdf', formData, {
          responseType: 'blob'
        });
        break;
        
      case 'extract':
        // Parse extract pages input (handle ranges like 1, 3-5, 7)
        const pages = [];
        extractPagesInput.value.split(',').forEach(part => {
          const range = part.trim().split('-');
          if (range.length === 1) {
            pages.push(parseInt(range[0]));
          } else {
            for (let i = parseInt(range[0]); i <= parseInt(range[1]); i++) {
              pages.push(i);
            }
          }
        });
        formData.append('pages', JSON.stringify(pages));
        response = await axios.post('/api/extract-pages', formData, {
          responseType: 'blob'
        });
        break;
        
      case 'watermark':
        formData.append('text', watermarkText.value);
        formData.append('options', JSON.stringify({
          opacity: parseFloat(watermarkOpacity.value),
          position: watermarkPosition.value
        }));
        response = await axios.post('/api/add-watermark', formData, {
          responseType: 'blob'
        });
        break;
    }
    
    result.value = {
      url: URL.createObjectURL(response.data)
    };
  } catch (error) {
    alert('Erro ao processar PDF: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.pdf-editor-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.editor-tabs {
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.tab-buttons {
  display: flex;
  background: #f8f9fa;
}

.tab-buttons button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.3s;
}

.tab-buttons button.active {
  background: #007bff;
  color: white;
}

.tab-content {
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.rotation-controls,
.split-controls,
.extract-controls,
.watermark-controls {
  margin: 1rem 0;
}

.page-rotation {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
}

.page-rotation label {
  width: 100px;
}

.page-rotation select {
  flex: 1;
  padding: 0.25rem;
}

.result {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f0fff0;
  border-radius: 8px;
}

.download-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #2a75ff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.3s;
}

.download-btn:hover {
  background: #1a65e0;
}

.multiple-files ul {
  list-style: none;
  padding: 0;
}

.multiple-files li {
  margin: 0.5rem 0;
}
</style>
```

## Integration Points

### 1. Update App Navigation (frontend/client/src/App.vue)
Add link to new tool in navigation:
```vue
<router-link to="/pdf-editor">Editor de PDF</router-link>
```

### 2. Update Home Page (frontend/client/src/components/pages/Home.vue)
Add tool card for PDF editor:
```vue
<ToolCard 
  icon="✏️"
  title="Editor de PDF"
  description="Rotacione, divida, extraia páginas ou adicione marcas d'água"
  to="/pdf-editor"
/>
```

### 3. Update Router (frontend/client/src/components/router/index.js)
Add new route:
```javascript
import PdfEditor from '../pages/PdfEditor.vue';

const routes = [
  // existing routes
  { path: '/pdf-editor', component: PdfEditor }
];
```

## Dependencies to Install
- archiver (for ZIP file creation when splitting PDFs)

## Error Handling
- Validate PDF file format
- Handle page number validation
- Handle large file processing errors
- Display user-friendly error messages

## Performance Considerations
- Show progress during long operations
- Optimize for large PDFs
- Implement streaming for large file processing
- Provide cancellation options for long operations