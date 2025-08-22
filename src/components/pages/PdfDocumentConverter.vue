<template>
  <div class="pdf-converter-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>
    
    <h1>🔄 Converter PDF para Documentos</h1>
    <p>Converta seus arquivos PDF para Word, PowerPoint, Texto ou HTML - Sem filas, como em outros sites!</p>
    
    <FileDrop @file-changed="handleFile" accept="application/pdf" />
    
    <div v-if="file" class="conversion-options">
      <label for="outputFormat">Formato de saída:</label>
      <select id="outputFormat" v-model="outputFormat">
        <option value="txt">Texto (TXT)</option>
        <option value="docx">Word (DOCX)</option>
        <option value="pptx">PowerPoint (PPTX)</option>
        <option value="html">HTML</option>
      </select>
      
      <p><small>Seu PDF será convertido para o formato selecionado. O conteúdo textual do PDF será extraído e formatado para o formato escolhido.</small></p>
    </div>
    
    <div v-if="processing" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
    
    <button @click="convertPdf" :disabled="!file || processing">
      {{ processing ? 'Convertendo...' : 'Converter PDF' }}
    </button>
    
    <AdBanner v-if="!result" size="300x250" />
    
    <div v-if="result" class="result">
      <h3>✅ PDF convertido com sucesso!</h3>
      <p>Seu documento foi convertido e está pronto para download.</p>
      <a :href="result.url" :download="result.filename" class="download-btn">
        Baixar Documento
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
const outputFormat = ref('docx');
const processing = ref(false);
const progress = ref(0);
const result = ref(null);

const handleFile = (uploadedFile) => {
  file.value = uploadedFile;
  result.value = null;
  progress.value = 0;
};

const convertPdf = async () => {
  processing.value = true;
  progress.value = 0;
  
  // Simulate progress for better UX
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10;
    }
  }, 200);
  
  const formData = new FormData();
  formData.append('pdf', file.value);
  formData.append('format', outputFormat.value);
  
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const response = await axios.post(`${baseURL}/api/pdf-to-document`, formData, {
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
    let filename = 'documento.docx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    result.value = { 
      url: URL.createObjectURL(blob),
      filename: filename
    };
  } catch (error) {
    alert('Erro ao converter PDF: ' + (error.response?.data?.error || error.message));
  } finally {
    clearInterval(progressInterval);
    processing.value = false;
  }
};
</script>

<style scoped>
.pdf-converter-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.feature-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.large-file {
  background: #e6fff4;
  color: #2b8a3e;
}

.no-watermark {
  background: #fff8e6;
  color: #e69900;
}

.fast {
  background: #e7f3ff;
  color: #2a75ff;
}

.conversion-options {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.conversion-options label {
  display: block;
  margin: 0.5rem 0;
  font-weight: bold;
}

.conversion-options select {
  width: 100%;
  padding: 0.5rem;
  margin: 0.25rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background: #2a75ff;
  transition: width 0.3s;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0fff0;
  border-radius: 8px;
  text-align: center;
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
</style>