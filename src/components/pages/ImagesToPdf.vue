<template>
  <div class="images-to-pdf-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>
    
    <h1>🖼️ Criar PDF a partir de Imagens Profissional</h1>
    <p class="subtitle">Converta suas imagens em um único arquivo PDF com facilidade!</p>
    
    <div class="upload-section">
      <h2>Adicionar Imagens</h2>
      <div class="upload-area">
        <div
          class="drop-zone"
          @dragover.prevent
          @dragenter.prevent
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDragging }"
        >
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            multiple
            accept="image/*"
            style="display: none;"
          />
          <div @click="openFilePicker" class="drop-zone-content">
            <div class="placeholder-icon">🖼️</div>
            <p>Arraste e solte suas imagens aqui</p>
            <p>ou</p>
            <button class="browse-btn">Selecionar Imagens</button>
            <p class="placeholder-subtext">Formatos suportados: JPG, PNG, WEBP</p>
          </div>
        </div>
      </div>
    </div>

    <div class="images-preview-section">
      <h3>Imagens selecionadas ({{ images.length }})</h3>
      <div class="image-list-container">
        <div
          v-if="images.length > 0"
          class="image-list"
        >
          <div
            v-for="(image, index) in images"
            :key="index"
            class="image-item"
          >
            <img :src="image.preview" :alt="image.name" />
            <div class="image-info">
              <span class="image-name">{{ image.name }}</span>
              <span class="image-size">{{ formatFileSize(image.size) }}</span>
            </div>
            <button @click="removeImage(index)" class="remove-btn">Remover</button>
          </div>
        </div>
        <div v-else class="preview-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">📄</div>
            <p>Nenhuma imagem adicionada ainda</p>
            <p class="placeholder-subtext">Adicione imagens usando o campo acima</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="processing" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <button
      @click="createPdf"
      :disabled="images.length === 0 || processing"
      class="primary-btn create-pdf-btn"
    >
      {{ processing ? 'Criando PDF...' : 'Criar PDF' }}
    </button>

    <AdBanner v-if="!result" size="300x250" />

    <div v-if="result" class="result">
      <h3>✅ PDF criado com sucesso!</h3>
      <p>Seu PDF foi criado e está pronto para download.</p>
      <a :href="result.url" download="imagens-convertidas.pdf" class="download-btn">
        Baixar PDF
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import AdBanner from '@/components/AdBanner.vue';

const images = ref([]);
const isDragging = ref(false);
const fileInput = ref(null);
const processing = ref(false);
const progress = ref(0);
const result = ref(null);

const openFilePicker = () => {
  fileInput.value.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addImages(files);
};

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  addImages(files);
};

const addImages = (files) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      images.value.push({
        file: file,
        name: file.name,
        size: file.size,
        preview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  images.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const createPdf = async () => {
  if (images.value.length === 0) return;

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
  images.value.forEach(image => {
    formData.append('images', image.file);
  });

  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const response = await axios.post(`${baseURL}/api/images-to-pdf`, formData, {
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          progress.value = Math.round((progressEvent.loaded / progressEvent.total) * 50);
        }
      }
    });

    // Complete progress
    progress.value = 100;

    const blob = new Blob([response.data], { type: 'application/pdf' });
    result.value = { url: URL.createObjectURL(blob) };
  } catch (error) {
    alert('Erro ao criar PDF: ' + (error.response?.data?.error || error.message));
  } finally {
    clearInterval(progressInterval);
    processing.value = false;
  }
};
</script>

<style scoped>
.images-to-pdf-page {
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

.upload-section {
  margin: 2rem 0;
}

.upload-section h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.upload-area {
  margin: 1rem 0;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  background: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
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

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #9e9e9e;
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

.placeholder-subtext {
  color: #999 !important;
  font-size: 0.9rem !important;
  margin-top: 0.5rem;
}

.images-preview-section {
  margin: 2rem 0;
}

.images-preview-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.image-list-container {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  background: #f8f9fa;
  min-height: 200px;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
}

.image-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.image-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 1rem;
  border: 1px solid #eee;
}

.image-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.image-size {
  font-size: 0.9rem;
  color: #666;
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

.placeholder-content .placeholder-icon {
  font-size: 3rem;
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

.create-pdf-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  margin: 1rem 0;
  transition: all 0.3s;
  font-weight: 600;
}

.create-pdf-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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