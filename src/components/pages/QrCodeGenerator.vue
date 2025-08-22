<template>
  <div class="qr-code-generator-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>
    
    <h1>📱 Gerador de QR Code</h1>
    <p class="subtitle">Gere códigos QR a partir de URLs ou textos e baixe em formato PNG ou SVG!</p>
    
    <div class="generator-container">
      <div class="input-section">
        <h2>Criar QR Code</h2>
        <div class="form-group">
          <label for="textInput">Digite uma URL ou texto:</label>
          <textarea 
            id="textInput" 
            v-model="textInput" 
            placeholder="https://exemplo.com ou qualquer texto"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="outputFormat">Formato de saída:</label>
          <select id="outputFormat" v-model="outputFormat">
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </select>
        </div>
        
        <button
          @click="generateQrCode"
          :disabled="!textInput || processing"
          class="primary-btn generate-btn"
        >
          {{ processing ? 'Gerando...' : 'Gerar QR Code' }}
        </button>
      </div>
      
      <div class="preview-section">
        <h2>Preview do QR Code</h2>
        <div class="preview-container">
          <div v-if="qrCodeUrl" class="qr-preview">
            <img v-if="outputFormat === 'png'" :src="qrCodeUrl" alt="QR Code" class="qr-image" />
            <div v-else-if="outputFormat === 'svg'" v-html="qrCodeSvg" class="qr-svg"></div>
            <p class="qr-text">{{ textInput }}</p>
          </div>
          <div v-else class="preview-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">📱</div>
              <p>O QR Code gerado aparecerá aqui</p>
              <p class="placeholder-subtext">Digite um texto ou URL e clique em "Gerar QR Code"</p>
            </div>
          </div>
        </div>
        
        <div v-if="qrCodeUrl" class="action-buttons">
          <a :href="qrCodeUrl" :download="`qrcode.${outputFormat}`" class="download-btn">
            Baixar QR Code
          </a>
        </div>
      </div>
    </div>
    
    <AdBanner v-if="!qrCodeUrl" size="300x250" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import AdBanner from '@/components/AdBanner.vue';

const textInput = ref('');
const outputFormat = ref('png');
const processing = ref(false);
const qrCodeUrl = ref('');
const qrCodeSvg = ref('');

const generateQrCode = async () => {
  if (!textInput.value) {
    alert('Por favor, digite uma URL ou texto.');
    return;
  }
  
  processing.value = true;
  qrCodeUrl.value = '';
  qrCodeSvg.value = '';
  
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const response = await axios.post(`${baseURL}/api/generate-qr-code`, {
      text: textInput.value,
      format: outputFormat.value
    }, {
      responseType: outputFormat.value === 'svg' ? 'text' : 'blob'
    });
    
    if (outputFormat.value === 'svg') {
      qrCodeSvg.value = response.data;
      // For SVG, we need to create a data URL
      const blob = new Blob([response.data], { type: 'image/svg+xml' });
      qrCodeUrl.value = URL.createObjectURL(blob);
    } else {
      const blob = new Blob([response.data], { type: 'image/png' });
      qrCodeUrl.value = URL.createObjectURL(blob);
    }
  } catch (error) {
    alert('Erro ao gerar QR Code: ' + (error.response?.data?.error || error.message));
  } finally {
    processing.value = false;
  }
};
</script>

<style scoped>
.qr-code-generator-page {
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

.generator-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .generator-container {
    grid-template-columns: 1fr;
  }
}

.input-section,
.preview-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.input-section h2,
.preview-section h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
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

.form-group textarea,
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group textarea:focus,
.form-group input:focus,
.form-group select:focus {
  border-color: #2a75ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(42, 117, 255, 0.2);
}

.primary-btn {
  background: linear-gradient(135deg, #2a75ff, #1a65e0) !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0.85rem 1.75rem !important;
  box-shadow: 0 4px 12px rgba(42, 117, 255, 0.3) !important;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
  width: 100%;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1a65e0, #0a55d0) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(42, 117, 255, 0.4) !important;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-container {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  background: #f8f9fa;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #fafafa;
  width: 100%;
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

.qr-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  width: 100%;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.qr-svg {
  max-width: 100%;
  height: auto;
}

.qr-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  word-break: break-all;
}

.action-buttons {
  margin-top: 1.5rem;
  text-align: center;
}

.download-btn {
  display: inline-block;
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, #2a75ff, #1a65e0);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(42, 117, 255, 0.3);
  border: none;
  cursor: pointer;
}

.download-btn:hover {
  background: linear-gradient(135deg, #1a65e0, #0a55d0);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(42, 117, 255, 0.4);
}
</style>