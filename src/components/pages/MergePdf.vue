<template>
  <div class="merge-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>

    <h1>📄 Unir PDFs Profissional</h1>
    <p class="subtitle">Combine múltiplos arquivos PDF em um único documento com facilidade!</p>

    <!-- Área de upload -->
    <div class="upload-section">
      <h2>Adicionar PDFs</h2>
      <div class="upload-area">
        <FileDrop
          @file-changed="addPdf"
          accept="application/pdf"
          multiple
        />
        <small>Arraste ou clique para adicionar PDFs (máx. 5)</small>
      </div>
    </div>

    <!-- Lista de PDFs adicionados -->
    <div class="pdf-list-section">
      <h3>Arquivos selecionados:</h3>
      <div class="pdf-list-container">
        <ul v-if="pdfs.length > 0">
          <li v-for="(pdf, index) in pdfs" :key="index" class="pdf-item">
            <div class="pdf-info">
              <span class="pdf-name">{{ pdf.name }}</span>
              <span class="pdf-size">({{ formatFileSize(pdf.size) }})</span>
            </div>
            <button @click="removePdf(index)" class="remove-btn">×</button>
          </li>
        </ul>
        <div v-else class="preview-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">📄</div>
            <p>Nenhum PDF adicionado ainda</p>
            <p class="placeholder-subtext">Adicione PDFs usando o campo acima</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Botão de ação -->
    <button
      @click="mergePdfs"
      :disabled="pdfs.length < 2 || loading"
      class="primary-btn merge-btn"
    >
      {{ loading ? 'Unindo PDFs...' : 'Unir PDFs' }}
    </button>

    <!-- Resultado -->
    <div v-if="mergedUrl" class="result">
      <h3>✅ PDF unido com sucesso!</h3>
      <a :href="mergedUrl" download="documento-unido.pdf" class="download-btn">
        Baixar Documento
      </a>
    </div>

    <AdBanner v-if="!mergedUrl" size="300x250" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import FileDrop from '@/components/FileDrop.vue';
import AdBanner from '@/components/AdBanner.vue';

const pdfs = ref([]);
const loading = ref(false);
const mergedUrl = ref(null);

// Adiciona PDF à lista
const addPdf = (file) => {
  if (pdfs.value.length >= 5) {
    alert('Máximo de 5 PDFs atingido!');
    return;
  }
  pdfs.value.push(file);
};

// Remove PDF da lista
const removePdf = (index) => {
  pdfs.value.splice(index, 1);
};

// Formata tamanho do arquivo (corrigido)
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Envia PDFs para o backend
const mergePdfs = async () => {
  loading.value = true;
  const formData = new FormData();

  pdfs.value.forEach((pdf) => {
    formData.append('pdfs', pdf);
  });

  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const response = await axios.post(`${baseURL}/api/merge-pdfs`, formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    mergedUrl.value = URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Erro ao unir PDFs:', error);
    alert('Falha ao unir PDFs. Verifique os arquivos e tente novamente.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.merge-page {
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
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  background: #f8f9fa;
  padding: 2rem;
  text-align: center;
}

.pdf-list-section {
  margin: 2rem 0;
}

.pdf-list-section h3 {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.pdf-list-container {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  background: #fff;
  padding: 1rem;
}

.pdf-list-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pdf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.pdf-item:last-child {
  border-bottom: none;
}

.pdf-info {
  flex: 1;
}

.pdf-name {
  font-weight: 600;
  color: #333;
}

.pdf-size {
  color: #666;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

.remove-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin-bottom: 0.5rem;
  color: #9e9e9e;
}

.placeholder-content p {
  margin: 0.25rem 0;
  color: #666;
}

.placeholder-subtext {
  color: #999 !important;
  font-size: 0.8rem !important;
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

.result {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fff0, #e6ffe6);
  border-radius: 12px;
  border: 1px solid #d0f0d0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  text-align: center;
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