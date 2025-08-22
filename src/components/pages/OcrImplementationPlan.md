# OCR Implementation Plan

## Overview
This document outlines the implementation plan for the OCR functionality that will allow users to extract text from images and PDFs.

## Backend Implementation

### 1. Dependencies
- tesseract.js (for OCR processing)
- pdfjs-dist (for PDF text extraction, already useful for other PDF operations)

### 2. Utility Function (server/utils/ocrProcessor.js)
```javascript
const Tesseract = require('tesseract.js');

/**
 * Extract text from image using OCR
 * @param {Buffer} buffer - Image buffer
 * @param {string} language - Language code (por, eng, spa, etc.)
 * @returns {Object} OCR result with text and confidence
 */
module.exports = async (buffer, language = 'por') => {
  try {
    const result = await Tesseract.recognize(
      buffer,
      language,
      {
        logger: info => console.log(info)
      }
    );
    
    return {
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};
```

### 3. Controller Function (server/controllers/toolsController.js)
```javascript
// Add to existing controller
async processOcr(req, res) {
  try {
    const { buffer } = req.file;
    const { language, outputFormat } = req.body;
    
    // Process OCR
    const ocrResult = await require('../utils/ocrProcessor')(
      buffer, 
      language
    );
    
    // Return based on output format
    if (outputFormat === 'json') {
      res.json(ocrResult);
    } else {
      // Default to plain text
      res.set('Content-Type', 'text/plain');
      res.send(ocrResult.text);
    }
  } catch (error) {
    res.status(500).json({ error: 'Falha ao processar OCR' });
  }
}
```

### 4. API Route (server/routes/api.js)
```javascript
// Add to existing routes
router.post('/ocr-process', upload.single('file'), toolsController.processOcr);
```

## Frontend Implementation

### 1. Vue Component (frontend/client/src/components/pages/OcrReader.vue)
```vue
<template>
  <div class="ocr-page">
    <h1>🔍 OCR Online</h1>
    <p>Extraia texto de imagens ou PDFs</p>
    
    <FileDrop @file-changed="handleFile" accept="image/*,application/pdf" />
    
    <div v-if="file" class="ocr-options">
      <label for="language">Idioma do documento:</label>
      <select id="language" v-model="selectedLanguage">
        <option value="por">Português</option>
        <option value="eng">Inglês</option>
        <option value="spa">Espanhol</option>
        <option value="fra">Francês</option>
        <option value="deu">Alemão</option>
      </select>
      
      <label for="outputFormat">Formato de saída:</label>
      <select id="outputFormat" v-model="outputFormat">
        <option value="text">Texto simples</option>
        <option value="json">JSON (com confiança)</option>
      </select>
    </div>
    
    <button @click="processOcr" :disabled="!file || loading">
      {{ loading ? 'Processando...' : 'Processar OCR' }}
    </button>
    
    <AdBanner v-if="!result" size="300x250" />
    
    <div v-if="result" class="result">
      <h3>✅ Texto extraído:</h3>
      <div class="text-result" v-if="outputFormat === 'text'">
        <textarea v-model="result.text" readonly></textarea>
        <button @click="copyToClipboard">Copiar para área de transferência</button>
        <a @click="downloadText" href="#">Baixar como arquivo de texto</a>
      </div>
      <div class="json-result" v-else>
        <p>Confiança: {{ result.confidence.toFixed(2) }}%</p>
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
        <button @click="copyToClipboard">Copiar JSON</button>
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
const selectedLanguage = ref('por');
const outputFormat = ref('text');
const loading = ref(false);
const result = ref(null);

const handleFile = (uploadedFile) => {
  file.value = uploadedFile;
  result.value = null;
};

const processOcr = async () => {
  loading.value = true;
  const formData = new FormData();
  formData.append('file', file.value);
  formData.append('language', selectedLanguage.value);
  formData.append('outputFormat', outputFormat.value);
  
  try {
    const response = await axios.post('/api/ocr-process', formData);
    
    result.value = response.data;
  } catch (error) {
    alert('Erro ao processar OCR: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(
    outputFormat.value === 'text' ? result.value.text : JSON.stringify(result.value, null, 2)
  ).then(() => {
    alert('Texto copiado para a área de transferência!');
  });
};

const downloadText = () => {
  const blob = new Blob([result.value.text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'texto-extraido.txt';
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.ocr-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.ocr-options {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.ocr-options label {
  display: block;
  margin: 0.5rem 0;
  font-weight: bold;
}

.ocr-options select {
  width: 100%;
  padding: 0.5rem;
  margin: 0.25rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0fff0;
  border-radius: 8px;
}

.text-result textarea {
  width: 100%;
  height: 200px;
  margin: 1rem 0;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.json-result pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
```

## Integration Points

### 1. Update App Navigation (frontend/client/src/App.vue)
Add link to new tool in navigation:
```vue
<router-link to="/ocr">OCR Online</router-link>
```

### 2. Update Home Page (frontend/client/src/components/pages/Home.vue)
Add tool card for OCR:
```vue
<ToolCard 
  icon="🔍"
  title="OCR Online"
  description="Extraia texto de imagens ou PDFs"
  to="/ocr"
/>
```

### 3. Update Router (frontend/client/src/components/router/index.js)
Add new route:
```javascript
import Ocr from '../pages/OcrReader.vue';

const routes = [
  // existing routes
  { path: '/ocr', component: Ocr }
];
```

## Dependencies to Install
- tesseract.js

## Error Handling
- Validate file type on upload
- Handle OCR processing errors
- Display user-friendly error messages
- Handle language detection failures

## Performance Considerations
- Show progress during OCR processing
- Optimize for large images/PDFs
- Cache language models when possible
- Implement timeouts for long processing operations