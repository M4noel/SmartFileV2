<template>
  <div class="document-converter-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>
    
    <h1>🔄 Conversor de Documentos para Imagens</h1>
    <p class="subtitle">Converta PDF, DOCX, XLSX, PPTX, TXT, CSV, JSON, XML, HTML, Markdown e imagens para formatos de imagem (JPG, PNG, WebP, TIFF) com facilidade!</p>
    
    <div class="converter-container">
      <!-- Single file conversion -->
      <div class="conversion-section">
        <h2>Converter Arquivo Único</h2>
        <FileDrop @file-changed="handleFile" accept="*" />
        
        <!-- Preview do arquivo carregado -->
        <div class="file-preview-section">
          <h3>Preview do Arquivo</h3>
          <div class="file-viewer-container">
            <div class="file-viewer-wrapper">
              <div v-if="file" class="file-info">
                <p><strong>Nome:</strong> {{ file.name }}</p>
                <p><strong>Tamanho:</strong> {{ formatFileSize(file.size) }}</p>
                <p><strong>Tipo:</strong> {{ file.type }}</p>
              </div>
              <div v-else class="preview-placeholder">
                <div class="placeholder-content">
                  <div class="placeholder-icon">📄</div>
                  <p>Selecione um arquivo para visualizar</p>
                  <p class="placeholder-subtext">Ou arraste e solte um arquivo aqui</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="conversion-options">
          <h3>Opções de Conversão</h3>
          <div class="form-group">
            <label for="inputFormat">Formato de entrada detectado:</label>
            <input id="inputFormat" v-model="inputFormat" readonly class="readonly-input" />
          </div>
          
          <div class="form-group">
            <label for="outputFormat">Formato de saída:</label>
            <select id="outputFormat" v-model="outputFormat">
              <option value="jpg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="tiff">TIFF</option>
            </select>
          </div>
          
          <div class="form-group" v-if="isImageFormat(outputFormat)">
            <label for="quality">Qualidade (para imagens):</label>
            <input id="quality" type="range" v-model.number="quality" min="1" max="100" />
            <span>{{ quality }}%</span>
          </div>
        </div>
      </div>
      
      <!-- Batch conversion -->
      <div class="conversion-section">
        <h2>Converter Arquivos em Lote</h2>
        <div class="upload-section">
          <h3>Adicionar Arquivos</h3>
          <div
            class="drop-zone"
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleBatchDrop"
            :class="{ 'drag-over': isBatchDragging }"
          >
            <input
              type="file"
              ref="batchFileInput"
              @change="handleBatchFileSelect"
              multiple
              style="display: none;"
            />
            <div @click="openBatchFilePicker" class="drop-zone-content">
              <div class="placeholder-icon">📁</div>
              <p>Arraste e solte vários arquivos aqui</p>
              <p>ou</p>
              <button class="browse-btn">Selecionar Arquivos</button>
              <p class="placeholder-subtext">Formatos suportados: PDF, DOCX, XLSX, PPTX, TXT, CSV, JSON, XML, HTML, MD, JPG, PNG, WEBP, TIFF</p>
            </div>
          </div>
        </div>
        
        <div class="batch-preview-section">
          <h3>Arquivos selecionados ({{ batchFiles.length }})</h3>
          <div class="file-list-container">
            <div
              v-if="batchFiles.length > 0"
              class="file-list"
            >
              <div
                v-for="(file, index) in batchFiles"
                :key="index"
                class="file-item"
              >
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <button @click="removeBatchFile(index)" class="remove-btn">Remover</button>
              </div>
            </div>
            <div v-else class="preview-placeholder">
              <div class="placeholder-content">
                <div class="placeholder-icon">📄</div>
                <p>Nenhum arquivo adicionado ainda</p>
                <p class="placeholder-subtext">Adicione arquivos usando o campo acima</p>
              </div>
            </div>
          </div>
          
          <div class="form-group" v-if="batchFiles.length > 0">
            <label for="batchOutputFormat">Formato de saída para todos os arquivos:</label>
            <select id="batchOutputFormat" v-model="batchOutputFormat">
              <option value="jpg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="tiff">TIFF</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="processing" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
    
    <div class="action-buttons">
      <button
        @click="convertSingle"
        :disabled="!file || processing"
        class="primary-btn convert-btn"
      >
        {{ processing ? 'Convertendo...' : 'Converter Arquivo Único' }}
      </button>
      
      <button
        @click="convertBatch"
        :disabled="batchFiles.length === 0 || processing"
        class="primary-btn convert-btn batch"
      >
        {{ processing ? 'Convertendo em Lote...' : 'Converter em Lote' }}
      </button>
    </div>
    
    <AdBanner v-if="!result" size="300x250" />
    
    <div v-if="result" class="result">
      <h3>✅ Documento(s) convertido(s) com sucesso!</h3>
      <p v-if="result.type === 'single'">Seu documento foi convertido e está pronto para download.</p>
      <p v-if="result.type === 'batch'">Seus documentos foram convertidos e estão em um arquivo ZIP para download.</p>
      <a :href="result.url" :download="result.filename" class="download-btn">
        {{ result.type === 'single' ? 'Baixar Documento' : 'Baixar Arquivos ZIP' }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import FileDrop from '@/components/FileDrop.vue';
import AdBanner from '@/components/AdBanner.vue';

// Single file conversion
const file = ref(null);
const inputFormat = ref('');
const outputFormat = ref('jpg');
const quality = ref(80);
const processing = ref(false);
const progress = ref(0);
const result = ref(null);

// Batch conversion
const batchFiles = ref([]);
const batchOutputFormat = ref('jpg');
const isBatchDragging = ref(false);
const batchFileInput = ref(null);

const handleFile = async (selectedFile) => {
  file.value = selectedFile;
  result.value = null;
  progress.value = 0;
  
  if (selectedFile) {
    // Try to detect input format
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    inputFormat.value = ext;
  }
};

const isImageFormat = (format) => {
  return ['jpg', 'jpeg', 'png', 'webp', 'tiff'].includes(format);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Batch file handling
const openBatchFilePicker = () => {
  batchFileInput.value.click();
};

const handleBatchFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addBatchFiles(files);
};

const handleBatchDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  addBatchFiles(files);
};

const addBatchFiles = (files) => {
  batchFiles.value.push(...files);
};

const removeBatchFile = (index) => {
  batchFiles.value.splice(index, 1);
};

// Conversion functions
const convertSingle = async () => {
  if (!file.value) {
    alert('Por favor, selecione um arquivo para converter.');
    return;
  }

  processing.value = true;
  progress.value = 0;
  result.value = null;

  // Simulate progress for better UX
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10;
    }
  }, 200);

  const formData = new FormData();
  formData.append('file', file.value);
  formData.append('inputFormat', inputFormat.value);
  formData.append('outputFormat', outputFormat.value);
  formData.append('quality', quality.value);

  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const response = await axios.post(`${baseURL}/api/convert-document`, formData, {
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          progress.value = Math.round((progressEvent.loaded / progressEvent.total) * 50);
        }
      }
    });

    // Complete progress
    progress.value = 100;

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'documento-convertido.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    result.value = { 
      type: 'single',
      url: URL.createObjectURL(blob),
      filename: filename
    };
  } catch (error) {
    alert('Erro ao converter documento: ' + (error.response?.data?.error || error.message));
  } finally {
    clearInterval(progressInterval);
    processing.value = false;
  }
};

const convertBatch = async () => {
  if (batchFiles.value.length === 0) {
    alert('Por favor, selecione pelo menos um arquivo para converter.');
    return;
  }

  processing.value = true;
  progress.value = 0;
  result.value = null;

  // Simulate progress for better UX
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10;
    }
  }, 200);

  const formData = new FormData();
  batchFiles.value.forEach(file => {
    formData.append('files', file);
  });
  formData.append('outputFormat', batchOutputFormat.value);
  formData.append('quality', quality.value);

  try {
    const response = await axios.post(`${baseURL}/api/convert-documents-batch`, formData, {
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
    result.value = { 
      type: 'batch',
      url: URL.createObjectURL(blob),
      filename: 'documentos-convertidos.zip'
    };
  } catch (error) {
    alert('Erro ao converter documentos em lote: ' + (error.response?.data?.error || error.message));
  } finally {
    clearInterval(progressInterval);
    processing.value = false;
  }
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

.converter-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .converter-container {
    grid-template-columns: 1fr;
  }
}

.conversion-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.conversion-section h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.file-preview-section,
.upload-section {
  margin: 1rem 0;
}

.file-preview-section h3,
.upload-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.file-viewer-container,
.file-list-container {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  background: #f8f9fa;
  min-height: 150px;
}

.file-viewer-wrapper,
.file-list-container {
  position: relative;
  min-height: 150px;
  background: #fff;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  background: #fafafa;
}

.placeholder-content {
  text-align: center;
  padding: 1rem;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #9e9e9e;
}

.placeholder-content p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 1rem;
}

.placeholder-subtext {
  color: #999 !important;
  font-size: 0.8rem !important;
}

.file-info p {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.conversion-options {
  margin: 1rem 0;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2a75ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(42, 117, 255, 0.2);
}

.readonly-input {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  margin: 1rem 0;
  background: #f8f9fa;
}

.drop-zone.drag-over {
  border-color: #2a75ff;
  background-color: #e7f3ff;
  transform: scale(1.02);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.browse-btn {
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, #2a75ff, #1a65e0);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin: 1rem 0;
  transition: all 0.3s;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(42, 117, 255, 0.3);
}

.browse-btn:hover {
  background: linear-gradient(135deg, #1a65e0, #0a55d0);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(42, 117, 255, 0.4);
}

.batch-preview-section {
  margin-top: 1rem;
}

.batch-preview-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.file-name {
  flex: 1;
  font-weight: 600;
  color: #333;
}

.file-size {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0.75rem;
}

.remove-btn {
  padding: 0.5rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  font-weight: 600;
}

.remove-btn:hover {
  background: #ff5252;
  transform: scale(1.05);
}

.primary-btn {
  background: linear-gradient(135deg, #2a75ff, #1a65e0) !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0.85rem 1.75rem !important;
  box-shadow: 0 4px 12px rgba(42, 117, 255, 0.3) !important;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1a65e0, #0a55d0) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(42, 117, 255, 0.4) !important;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.convert-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 200px;
  font-weight: 600;
}

.convert-btn.batch {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

.convert-btn:disabled {
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
  text-align: center;
  border: 1px solid #d0f0d0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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