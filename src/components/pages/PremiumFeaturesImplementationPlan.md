# Premium Features Implementation Plan

## Overview
This document outlines the implementation plan for premium features including batch download and temporary storage that will be offered for free to attract users.

## Backend Implementation

### 1. Dependencies
- archiver (for ZIP file creation)
- node-cron (for cleanup of temporary files)
- uuid (for generating unique file IDs)
- fs/promises (for file system operations)

### 2. Temporary Storage System (server/utils/tempStorage.js)
```javascript
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../../temp');
fs.mkdir(tempDir, { recursive: true }).catch(console.error);

// Schedule cleanup job (every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      // Delete files older than 24 hours
      if (now - stats.mtimeMs > 24 * 60 * 60 * 1000) {
        await fs.unlink(filePath);
        console.log(`Deleted expired file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

/**
 * Store file temporarily
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @returns {Object} Stored file info
 */
async function storeFile(buffer, filename) {
  const fileId = uuidv4();
  const storedFilename = `${fileId}-${filename}`;
  const filePath = path.join(tempDir, storedFilename);
  
  await fs.writeFile(filePath, buffer);
  
  return {
    id: fileId,
    filename: storedFilename,
    originalName: filename,
    path: filePath,
    createdAt: new Date()
  };
}

/**
 * Retrieve stored file
 * @param {string} fileId - File ID
 * @returns {Object} File info and buffer
 */
async function retrieveFile(fileId) {
  // Find file by ID
  const files = await fs.readdir(tempDir);
  const storedFile = files.find(file => file.startsWith(`${fileId}-`));
  
  if (!storedFile) {
    throw new Error('File not found or expired');
  }
  
  const filePath = path.join(tempDir, storedFile);
  const buffer = await fs.readFile(filePath);
  
  return {
    buffer,
    filename: storedFile,
    originalName: storedFile.substring(storedFile.indexOf('-') + 1)
  };
}

/**
 * Delete stored file
 * @param {string} fileId - File ID
 */
async function deleteFile(fileId) {
  const files = await fs.readdir(tempDir);
  const storedFile = files.find(file => file.startsWith(`${fileId}-`));
  
  if (storedFile) {
    const filePath = path.join(tempDir, storedFile);
    await fs.unlink(filePath);
  }
}

/**
 * Create ZIP archive from multiple files
 * @param {Array} files - Array of file objects
 * @returns {Buffer} ZIP archive buffer
 */
async function createZipArchive(files) {
  const archiver = require('archiver');
  const { Writable } = require('stream');
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });
    
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    archive.pipe(writableStream);
    
    files.forEach(file => {
      archive.append(file.buffer, { name: file.originalName });
    });
    
    archive.finalize();
    
    archive.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    archive.on('error', reject);
  });
}

module.exports = {
  storeFile,
  retrieveFile,
  deleteFile,
  createZipArchive
};
```

### 3. Controller Functions (server/controllers/toolsController.js)
```javascript
// Add to existing controller

/**
 * Store processed file for batch download
 */
async function storeProcessedFile(req, res) {
  try {
    const { buffer } = req.file;
    const { originalName } = req.body;
    
    const storedFile = await require('../utils/tempStorage').storeFile(
      buffer, 
      originalName || req.file.originalname
    );
    
    res.json({
      success: true,
      fileId: storedFile.id,
      filename: storedFile.originalName,
      createdAt: storedFile.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao armazenar arquivo' });
  }
}

/**
 * Retrieve stored file
 */
async function retrieveStoredFile(req, res) {
  try {
    const { fileId } = req.params;
    
    const file = await require('../utils/tempStorage').retrieveFile(fileId);
    
    // Set appropriate content type based on file extension
    const ext = path.extname(file.originalName).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.zip': 'application/zip'
    };
    
    res.set('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.send(file.buffer);
  } catch (error) {
    res.status(404).json({ error: 'Arquivo não encontrado ou expirado' });
  }
}

/**
 * Create batch download (ZIP)
 */
async function createBatchDownload(req, res) {
  try {
    const { fileIds } = req.body;
    
    // Retrieve all files
    const files = [];
    for (const fileId of fileIds) {
      try {
        const file = await require('../utils/tempStorage').retrieveFile(fileId);
        files.push(file);
      } catch (error) {
        console.warn(`Failed to retrieve file ${fileId}:`, error.message);
      }
    }
    
    if (files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo válido encontrado' });
    }
    
    // Create ZIP archive
    const zipBuffer = await require('../utils/tempStorage').createZipArchive(files);
    
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename="arquivos-processados.zip"');
    res.send(zipBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar download em lote' });
  }
}

module.exports = {
  // ... existing exports
  storeProcessedFile,
  retrieveStoredFile,
  createBatchDownload
};
```

### 4. API Routes (server/routes/api.js)
```javascript
// Add to existing routes
router.post('/store-file', upload.single('file'), toolsController.storeProcessedFile);
router.get('/retrieve-file/:fileId', toolsController.retrieveStoredFile);
router.post('/batch-download', toolsController.createBatchDownload);
```

## Frontend Implementation

### 1. Vue Component (frontend/client/src/components/pages/Extras.vue)
```vue
<template>
  <div class="extras-page">
    <h1>⭐ Recursos Premium</h1>
    <p>Funcionalidades avançadas gratuitamente</p>
    
    <div class="features-grid">
      <!-- Batch Download Feature -->
      <div class="feature-card">
        <h2>📥 Download em Lote</h2>
        <p>Baixe vários arquivos processados de uma vez</p>
        
        <div class="file-list" v-if="storedFiles.length > 0">
          <h3>Arquivos armazenados:</h3>
          <ul>
            <li v-for="file in storedFiles" :key="file.id">
              <span>{{ file.filename }}</span>
              <span class="file-date">{{ formatDate(file.createdAt) }}</span>
              <a :href="`/api/retrieve-file/${file.id}`" :download="file.filename">
                Baixar
              </a>
            </li>
          </ul>
          
          <button 
            @click="downloadBatch" 
            :disabled="storedFiles.length === 0 || batchLoading"
            class="batch-download-btn"
          >
            {{ batchLoading ? 'Preparando download...' : 'Baixar Todos em ZIP' }}
          </button>
        </div>
        
        <div v-else class="no-files">
          <p>Nenhum arquivo armazenado. Processe alguns arquivos nas outras ferramentas para vê-los aqui.</p>
        </div>
      </div>
      
      <!-- Temporary Storage Feature -->
      <div class="feature-card">
        <h2>💾 Armazenamento Temporário</h2>
        <p>Seus arquivos ficam disponíveis por 24h para download</p>
        
        <div class="storage-info">
          <p><strong>Sem cadastro necessário!</strong></p>
          <p>Seus arquivos são automaticamente excluídos após 24 horas.</p>
          <p v-if="storedFiles.length > 0">
            Você tem {{ storedFiles.length }} arquivo(s) armazenado(s).
          </p>
        </div>
        
        <AdBanner size="300x250" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AdBanner from '@/components/AdBanner.vue';

const storedFiles = ref([]);
const batchLoading = ref(false);

// Load stored files on component mount
onMounted(async () => {
  await loadStoredFiles();
});

const loadStoredFiles = async () => {
  try {
    // In a real implementation, we would need to track file IDs in localStorage
    // or have a backend endpoint to list stored files for the user
    // This is a simplified example
    const savedFileIds = JSON.parse(localStorage.getItem('storedFileIds') || '[]');
    // We would need to fetch file info from the backend
    // For now, we'll just show an empty state
  } catch (error) {
    console.error('Error loading stored files:', error);
  }
};

const downloadBatch = async () => {
  batchLoading.value = true;
  
  try {
    const savedFileIds = JSON.parse(localStorage.getItem('storedFileIds') || '[]');
    
    if (savedFileIds.length === 0) {
      alert('Nenhum arquivo para download');
      return;
    }
    
    const response = await axios.post('/api/batch-download', {
      fileIds: savedFileIds
    }, {
      responseType: 'blob'
    });
    
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arquivos-processados.zip';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('Erro ao criar download em lote: ' + error.message);
  } finally {
    batchLoading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};
</script>

<style scoped>
.extras-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.feature-card h2 {
  margin-top: 0;
  color: #2a75ff;
}

.file-list ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.file-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.file-date {
  font-size: 0.8rem;
  color: #666;
}

.batch-download-btn {
  background: #2b8a3e;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 1rem;
}

.batch-download-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.batch-download-btn:hover:not(:disabled) {
  background: #237032;
}

.no-files {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.storage-info {
  background: #e7f3ff;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.storage-info p {
  margin: 0.5rem 0;
}
</style>
```

## Integration Points

### 1. Update App Navigation (frontend/client/src/App.vue)
Update link to premium features:
```vue
<router-link to="/extras">Recursos Premium</router-link>
```

### 2. Update Home Page (frontend/client/src/components/pages/Home.vue)
Update tool card for premium features:
```vue
<ToolCard 
  icon="⭐"
  title="Recursos Premium"
  description="Download em lote e armazenamento temporário"
  to="/extras"
/>
```

### 3. Update Router (frontend/client/src/components/router/index.js)
Update route for extras:
```javascript
// Already exists, no change needed
```

## Dependencies to Install
- archiver
- node-cron
- uuid

## Error Handling
- Handle file storage errors
- Handle file retrieval errors
- Handle expired file access
- Handle batch download errors
- Display user-friendly error messages

## Performance Considerations
- Implement efficient cleanup of temporary files
- Optimize ZIP creation for multiple files
- Limit storage duration to 24 hours
- Monitor storage usage
- Implement rate limiting for batch downloads