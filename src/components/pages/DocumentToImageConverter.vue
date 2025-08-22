<template>
  <div class="document-converter-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>
    
    <h1>🔄 Converter Documentos para Imagens</h1>
    <p class="subtitle">Converta seus arquivos PDF, DOCX, PPTX, XLSX, TXT e RTF para imagens JPG, PNG ou WebP com facilidade!</p>
    
    <FileDrop @file-changed="handleFile" accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.rtf" />
    
    <!-- Preview do documento carregado -->
    <div class="pdf-preview-section">
      <h2>Preview do Documento</h2>
      <div class="pdf-viewer-container">
        <div class="pdf-viewer-wrapper">
          <div v-if="file" class="file-info">
            <p><strong>Nome:</strong> {{ file.name }}</p>
            <p><strong>Tamanho:</strong> {{ formatFileSize(file.size) }}</p>
            <p><strong>Tipo:</strong> {{ getDocumentType(file.name) }}</p>
          </div>
          <div v-else class="preview-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">📄</div>
              <p>Selecione um arquivo para visualizar</p>
              <p class="placeholder-subtext">Suporta: PDF, DOCX, PPTX, XLSX, TXT, RTF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="conversion-options">
      <h3>Opções de Conversão</h3>
      <div class="form-group">
        <label for="outputFormat">Formato de saída:</label>
        <select id="outputFormat" v-model="outputFormat">
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>
      </div>
      
      <p class="info-text">Seu documento será convertido para o formato selecionado. Cada página/slide/planilha será salva como uma imagem separada.</p>
    </div>
    
    <div v-if="processing" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
    
    <button @click="convertDocument" :disabled="!file || processing" class="primary-btn">
      {{ processing ? 'Convertendo...' : 'Converter Documento' }}
    </button>
    
    <AdBanner v-if="!result" size="300x250" />
    
    <div v-if="result" class="result">
      <h3>✅ Documento convertido com sucesso!</h3>
      <p>Suas imagens foram compactadas em um arquivo ZIP.</p>
      <a :href="result.url" download="documento-imagens.zip" class="download-btn">
        Baixar Imagens
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import FileDrop from '@/components/FileDrop.vue';
import AdBanner from '@/components/AdBanner.vue';

const file = ref(null);
const outputFormat = ref('jpeg');
const processing = ref(false);
const progress = ref(0);
const result = ref(null);

const handleFile = (uploadedFile) => {
  file.value = uploadedFile;
  result.value = null;
  progress.value = 0;
};

const convertDocument = async () => {
  processing.value = true;
  progress.value = 0;
  
  // Simulate progress for better UX
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10;
    }
  }, 200);
  
  const formData = new FormData();
  formData.append('document', file.value);
  formData.append('format', outputFormat.value);
  
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const response = await axios.post(`${baseURL}/api/document-to-images`, formData, {
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          progress.value = Math.round((progressEvent.loaded / progressEvent.total) * 50);
        }
      }
    });
    
    // Complete progress
    progress.value = 100;
    
    const blob = new Blob([response.data], { type: 'application/zip' });
    result.value = { url: URL.createObjectURL(blob) };
  } catch (error) {
    alert('Erro ao converter documento: ' + (error.response?.data?.error || error.message));
  } finally {
    clearInterval(progressInterval);
    processing.value = false;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getDocumentType = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  const typeMap = {
    'pdf': 'PDF Document',
    'docx': 'Word Document',
    'doc': 'Word Document',
    'pptx': 'PowerPoint Presentation',
    'ppt': 'PowerPoint Presentation',
    'xlsx': 'Excel Spreadsheet',
    'xls': 'Excel Spreadsheet',
    'txt': 'Text Document',
    'rtf': 'Rich Text Document'
  };
  return typeMap[ext] || 'Documento';
};
</script>

<style scoped>
.document-converter-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.feature-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.35rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.large-file {
  background: linear-gradient(135deg, #e6fff4, #c2f5e9);
  color: #0d7a4f;
}

.no-watermark {
  background: linear-gradient(135deg, #fff8e6, #ffe8b8);
  color: #e67a00;
}

.fast {
  background: linear-gradient(135deg, #e7f3ff, #c2e0ff);
  color: #1a73e8;
}

.pdf-preview-section {
  margin: 2rem 0;
}

.pdf-preview-section h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.pdf-viewer-container {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  background: #f8f9fa;
}

.pdf-viewer-wrapper {
  position: relative;
  min-height: 200px;
  background: #fff;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #fafafa;
}

.placeholder-content {
  text-align: center;
  padding: 2rem;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #9e9e9e;
}

.placeholder-content p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 1.1rem;
}

.placeholder-subtext {
  color: #999 !important;
  font-size: 0.9rem !important;
}

.file-info p {
  margin: 0.75rem 0;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.conversion-options {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  background: #fff;
}

.conversion-options h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #444;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group select:focus {
  border-color: #2a75ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(42, 117, 255, 0.2);
}

.info-text {
  color: #666;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.primary-btn {
  background: linear-gradient(135deg, #2a75ff, #1a65e0) !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0.85rem 1.75rem !important;
  margin-top: 1rem !important;
  box-shadow: 0 4px 12px rgba(42, 117, 255, 0.3) !important;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1a65e0, #0a55d0) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(42, 117, 255, 0.4) !important;
}

button {
  margin: 5px;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #eee;
  border-radius: 6px;
  overflow: hidden;
  margin: 1.5rem 0;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2a75ff, #1a65e0);
  transition: width 0.3s ease;
}

.result {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fff0, #e6ffe6);
  border-radius: 12px;
  border: 1px solid #d0f0d0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  text-align: center;
}

.result h3 {
  margin-top: 0;
  color: #0d7a4f;
}

.download-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, #2a75ff, #1a65e0);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(42, 117, 255, 0.3);
}

.download-btn:hover {
  background: linear-gradient(135deg, #1a65e0, #0a55d0);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(42, 117, 255, 0.4);
}
</style>