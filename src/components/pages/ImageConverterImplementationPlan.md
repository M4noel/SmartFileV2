# Image Converter Implementation Plan

## Overview
This document outlines the implementation plan for the image converter functionality that will allow users to convert between image formats (JPG, PNG, WEBP, SVG, etc.).

## Backend Implementation

### 1. Utility Function (server/utils/imageConverter.js)
```javascript
const sharp = require('sharp');

/**
 * Convert image between formats
 * @param {Buffer} buffer - Image buffer
 * @param {string} format - Target format (jpeg, png, webp, etc.)
 * @param {Object} options - Format-specific options
 * @returns {Buffer} Converted image buffer
 */
module.exports = async (buffer, format, options = {}) => {
  const sharpInstance = sharp(buffer);
  
  // Apply format-specific options
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      sharpInstance.jpeg({ quality: options.quality || 80 });
      break;
    case 'png':
      sharpInstance.png({ compressionLevel: options.compressionLevel || 6 });
      break;
    case 'webp':
      sharpInstance.webp({ quality: options.quality || 80 });
      break;
    case 'tiff':
      sharpInstance.tiff({ quality: options.quality || 80 });
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
  
  return await sharpInstance.toBuffer();
};
```

### 2. Controller Function (server/controllers/toolsController.js)
```javascript
// Add to existing controller
async convertImage(req, res) {
  try {
    const { buffer } = req.file;
    const { format, quality } = req.body;
    
    // Validate format
    const supportedFormats = ['jpeg', 'png', 'webp', 'tiff'];
    if (!supportedFormats.includes(format.toLowerCase())) {
      return res.status(400).json({ 
        error: `Unsupported format: ${format}` 
      });
    }
    
    // Convert image
    const convertedImage = await require('../utils/imageConverter')(
      buffer, 
      format, 
      { quality: parseInt(quality) || 80 }
    );
    
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
    res.status(500).json({ error: 'Falha ao converter imagem' });
  }
}
```

### 3. API Route (server/routes/api.js)
```javascript
// Add to existing routes
router.post('/convert-image', upload.single('image'), toolsController.convertImage);
```

## Frontend Implementation

### 1. Vue Component (frontend/client/src/components/pages/ImageConverter.vue)
```vue
<template>
  <div class="image-converter-page">
    <h1>🖼️ Converter de Imagens</h1>
    <p>Converta entre formatos (JPG, PNG, WEBP, etc.)</p>
    
    <FileDrop @file-changed="handleFile" accept="image/*" />
    
    <div v-if="preview" class="preview">
      <img :src="preview" alt="Preview" />
      <p>Formato original: {{ originalFormat }}</p>
    </div>
    
    <div v-if="file" class="format-selection">
      <label for="format">Formato de saída:</label>
      <select id="format" v-model="selectedFormat">
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WEBP</option>
        <option value="tiff">TIFF</option>
      </select>
      
      <label for="quality">Qualidade (para formatos com compressão):</label>
      <input 
        id="quality" 
        type="range" 
        v-model="quality" 
        min="1" 
        max="100" 
        :disabled="selectedFormat === 'png'"
      >
      <span>{{ quality }}%</span>
    </div>
    
    <button @click="convert" :disabled="!file || loading">
      {{ loading ? 'Convertendo...' : 'Converter' }}
    </button>
    
    <AdBanner v-if="!result" size="300x250" />
    
    <div v-if="result" class="result">
      <p>✅ Conversão concluída!</p>
      <a :href="result.url" :download="`imagem-convertida.${selectedFormat}`">
        Baixar {{ selectedFormat.toUpperCase() }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import FileDrop from '@/components/FileDrop.vue';
import AdBanner from '@/components/AdBanner.vue';

const file = ref(null);
const preview = ref(null);
const originalFormat = ref('');
const selectedFormat = ref('jpeg');
const quality = ref(80);
const loading = ref(false);
const result = ref(null);

const handleFile = (uploadedFile) => {
  file.value = uploadedFile;
  preview.value = URL.createObjectURL(uploadedFile);
  
  // Get original format from MIME type
  const mimeToFormat = {
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WEBP',
    'image/tiff': 'TIFF',
    'image/svg+xml': 'SVG'
  };
  
  originalFormat.value = mimeToFormat[uploadedFile.type] || 'Desconhecido';
  result.value = null;
};

const convert = async () => {
  loading.value = true;
  const formData = new FormData();
  formData.append('image', file.value);
  formData.append('format', selectedFormat.value);
  formData.append('quality', quality.value);
  
  try {
    const response = await axios.post('/api/convert-image', formData, {
      responseType: 'blob'
    });
    
    result.value = {
      url: URL.createObjectURL(response.data)
    };
  } catch (error) {
    alert('Erro ao converter: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.image-converter-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.preview img {
  max-width: 100%;
  margin-top: 1rem;
  border: 1px solid #ddd;
}

.format-selection {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.format-selection label {
  display: block;
  margin: 0.5rem 0;
  font-weight: bold;
}

.format-selection select,
.format-selection input {
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
</style>
```

## Integration Points

### 1. Update App Navigation (frontend/client/src/App.vue)
Add link to new tool in navigation:
```vue
<router-link to="/convert">Converter Imagens</router-link>
```

### 2. Update Home Page (frontend/client/src/components/pages/Home.vue)
Add tool card for image converter:
```vue
<ToolCard 
  icon="🖼️"
  title="Converter Imagem"
  description="Converta entre formatos (JPG, PNG, WEBP, etc.)"
  to="/convert"
/>
```

### 3. Update Router (frontend/client/src/components/router/index.js)
Add new route:
```javascript
import Convert from '../pages/ImageConverter.vue';

const routes = [
  // existing routes
  { path: '/convert', component: Convert }
];
```

## Dependencies
- Sharp (already installed)
- No additional dependencies required

## Error Handling
- Validate file type on upload
- Validate target format
- Handle conversion errors gracefully
- Display user-friendly error messages

## Performance Considerations
- Use Sharp's streaming capabilities for large files
- Implement progress indicators for long conversions
- Optimize quality settings for balance between file size and quality