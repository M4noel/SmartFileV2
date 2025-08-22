# Image Resizer Implementation Plan

## Overview
This document outlines the implementation plan for the image resizer functionality that will allow users to change image dimensions without losing quality.

## Backend Implementation

### 1. Dependencies
- sharp (already installed)
- No additional dependencies required

### 2. Utility Function (server/utils/imageResizer.js)
```javascript
const sharp = require('sharp');

/**
 * Resize image
 * @param {Buffer} buffer - Image buffer
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @param {Object} options - Resize options
 * @returns {Buffer} Resized image buffer
 */
module.exports = async (buffer, width, height, options = {}) => {
  const sharpInstance = sharp(buffer);
  
  // Get original image metadata
  const metadata = await sharpInstance.metadata();
  
  // Apply resize with options
  sharpInstance.resize(width, height, {
    fit: options.fit || 'inside', // 'inside', 'outside', 'cover', 'contain', 'fill'
    position: options.position || 'center', // 'center', 'top', 'bottom', etc.
    withoutEnlargement: options.withoutEnlargement || false, // Don't enlarge if smaller
    kernel: options.kernel || 'lanczos3' // Resizing algorithm
  });
  
  return await sharpInstance.toBuffer();
};
```

### 3. Controller Function (server/controllers/toolsController.js)
```javascript
// Add to existing controller
async resizeImage(req, res) {
  try {
    const { buffer } = req.file;
    const { width, height, fit, position, withoutEnlargement } = req.body;
    
    // Validate dimensions
    const targetWidth = parseInt(width);
    const targetHeight = parseInt(height);
    
    if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
      return res.status(400).json({ 
        error: 'Dimensões inválidas. Ambas largura e altura devem ser números positivos.' 
      });
    }
    
    // Resize image
    const resizedImage = await require('../utils/imageResizer')(
      buffer, 
      targetWidth, 
      targetHeight,
      {
        fit: fit || 'inside',
        position: position || 'center',
        withoutEnlargement: withoutEnlargement === 'true'
      }
    );
    
    res.set('Content-Type', 'image/jpeg');
    res.send(resizedImage);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao redimensionar imagem' });
  }
}
```

### 4. API Route (server/routes/api.js)
```javascript
// Add to existing routes
router.post('/resize-image', upload.single('image'), toolsController.resizeImage);
```

## Frontend Implementation

### 1. Vue Component (frontend/client/src/components/pages/ImageResizer.vue)
```vue
<template>
  <div class="image-resizer-page">
    <h1>📐 Redimensionar Imagem</h1>
    <p>Altere dimensões (pixels) sem perder qualidade</p>
    
    <FileDrop @file-changed="handleFile" accept="image/*" />
    
    <div v-if="preview" class="preview">
      <img :src="preview" alt="Preview" />
      <p>Dimensões originais: {{ originalWidth }} × {{ originalHeight }} pixels</p>
    </div>
    
    <div v-if="file" class="resize-options">
      <div class="dimensions-input">
        <label for="width">Largura (pixels):</label>
        <input 
          id="width" 
          type="number" 
          v-model="width" 
          min="1"
          @input="onDimensionChange"
        >
        
        <label for="height">Altura (pixels):</label>
        <input 
          id="height" 
          type="number" 
          v-model="height" 
          min="1"
          @input="onDimensionChange"
        >
        
        <label class="checkbox">
          <input 
            type="checkbox" 
            v-model="maintainAspectRatio"
          > Manter proporção
        </label>
      </div>
      
      <div class="advanced-options">
        <h4>Opções avançadas:</h4>
        
        <label for="fit">Método de ajuste:</label>
        <select id="fit" v-model="fit">
          <option value="inside">Dentro (mantém proporção, encolhe para caber)</option>
          <option value="outside">Fora (mantém proporção, amplia para preencher)</option>
          <option value="cover">Cobrir (corta para preencher)</option>
          <option value="contain">Conter (adiciona bordas para preencher)</option>
          <option value="fill">Preencher (distorce para preencher)</option>
        </select>
        
        <label for="position">Posição:</label>
        <select id="position" v-model="position">
          <option value="center">Centro</option>
          <option value="top">Topo</option>
          <option value="bottom">Base</option>
          <option value="left">Esquerda</option>
          <option value="right">Direita</option>
          <option value="top-left">Superior Esquerda</option>
          <option value="top-right">Superior Direita</option>
          <option value="bottom-left">Inferior Esquerda</option>
          <option value="bottom-right">Inferior Direita</option>
        </select>
        
        <label class="checkbox">
          <input 
            type="checkbox" 
            v-model="withoutEnlargement"
          > Não ampliar imagens menores
        </label>
      </div>
    </div>
    
    <button @click="resize" :disabled="!file || loading">
      {{ loading ? 'Redimensionando...' : 'Redimensionar' }}
    </button>
    
    <AdBanner v-if="!result" size="300x250" />
    
    <div v-if="result" class="result">
      <p>✅ Redimensionamento concluído!</p>
      <p>Novas dimensões: {{ result.width }} × {{ result.height }} pixels</p>
      <a :href="result.url" download="imagem-redimensionada.jpg">
        Baixar Imagem
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import FileDrop from '@/components/FileDrop.vue';
import AdBanner from '@/components/AdBanner.vue';

const file = ref(null);
const preview = ref(null);
const originalWidth = ref(0);
const originalHeight = ref(0);
const aspectRatio = ref(1);

const width = ref(800);
const height = ref(600);
const maintainAspectRatio = ref(true);
const fit = ref('inside');
const position = ref('center');
const withoutEnlargement = ref(false);

const loading = ref(false);
const result = ref(null);

const handleFile = async (uploadedFile) => {
  file.value = uploadedFile;
  preview.value = URL.createObjectURL(uploadedFile);
  result.value = null;
  
  // Get original dimensions
  const img = new Image();
  img.src = preview.value;
  img.onload = () => {
    originalWidth.value = img.width;
    originalHeight.value = img.height;
    aspectRatio.value = img.width / img.height;
    
    // Set initial dimensions
    width.value = img.width;
    height.value = img.height;
  };
};

const onDimensionChange = () => {
  if (maintainAspectRatio.value) {
    if (document.activeElement.id === 'width') {
      height.value = Math.round(width.value / aspectRatio.value);
    } else if (document.activeElement.id === 'height') {
      width.value = Math.round(height.value * aspectRatio.value);
    }
  }
};

const resize = async () => {
  loading.value = true;
  const formData = new FormData();
  formData.append('image', file.value);
  formData.append('width', width.value);
  formData.append('height', height.value);
  formData.append('fit', fit.value);
  formData.append('position', position.value);
  formData.append('withoutEnlargement', withoutEnlargement.value);
  
  try {
    const response = await axios.post('/api/resize-image', formData, {
      responseType: 'blob'
    });
    
    // Get dimensions of resized image
    const resizedImg = new Image();
    resizedImg.src = URL.createObjectURL(response.data);
    
    result.value = {
      url: URL.createObjectURL(response.data),
      width: resizedImg.width,
      height: resizedImg.height
    };
  } catch (error) {
    alert('Erro ao redimensionar: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.image-resizer-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.preview img {
  max-width: 100%;
  margin-top: 1rem;
  border: 1px solid #ddd;
}

.resize-options {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.dimensions-input {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dimensions-input label {
  display: block;
  margin: 0.5rem 0;
  font-weight: bold;
}

.dimensions-input input[type="number"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox {
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
}

.advanced-options h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.advanced-options label {
  display: block;
  margin: 0.5rem 0;
  font-weight: bold;
}

.advanced-options select {
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
<router-link to="/resize">Redimensionar Imagem</router-link>
```

### 2. Update Home Page (frontend/client/src/components/pages/Home.vue)
Add tool card for image resizer:
```vue
<ToolCard 
  icon="📐"
  title="Redimensionar Imagem"
  description="Altere dimensões (pixels) sem perder qualidade"
  to="/resize"
/>
```

### 3. Update Router (frontend/client/src/components/router/index.js)
Add new route:
```javascript
import Resize from '../pages/ImageResizer.vue';

const routes = [
  // existing routes
  { path: '/resize', component: Resize }
];
```

## Error Handling
- Validate input dimensions
- Handle file type validation
- Handle resize processing errors
- Display user-friendly error messages

## Performance Considerations
- Show preview of resized dimensions
- Implement client-side dimension validation
- Optimize resize quality settings
- Provide progress indicators for large images