<template>
  <div class="pdf-editor-page">
    <!-- Badges e título etc -->
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>

    <h1>✏️ Editor de PDF Profissional</h1>
    <p class="subtitle">Edite seus documentos PDF com facilidade - rotacione, divida, extraia páginas, adicione marcas d'água e muito mais!</p>
    
    <FileDrop @file-changed="handleFile" accept="application/pdf" />

    <!-- Preview do PDF carregado -->
    <div class="pdf-preview-section">
      <h2>Preview do PDF</h2>
      <div class="pdf-viewer-container">
        <div class="pdf-viewer-wrapper">
          <iframe
            :src="pdfUrl"
            width="100%"
            height="600"
            style="border: 1px solid #ccc;"
            v-if="pdfUrl"
          ></iframe>
          <div v-else class="preview-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">📄</div>
              <p>Selecione um arquivo PDF para visualizar</p>
              <p class="placeholder-subtext">Ou arraste e solte um arquivo aqui</p>
            </div>
          </div>
          <!-- Annotation preview overlay -->
          <div
            v-if="activeTab === 'addAnnotations' && file && commentContent"
            class="annotation-preview"
            :style="{
              left: commentX + 'px',
              top: commentY + 'px',
              width: commentBoxWidth + 'px',
              fontSize: commentFontSize + 'px',
              color: commentTextColor,
              backgroundColor: commentBgColor
            }"
          >
            {{ commentContent }}
          </div>
        </div>
      </div>
    </div>

    <div class="editor-tabs">
      <div class="tab-buttons">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Rotate Pages Tab -->
      <div v-if="activeTab === 'rotate'" class="tab-content">
        <h3>Rotacionar Páginas</h3>
        <div class="rotation-controls">
          <div v-for="(rotation, index) in rotations" :key="index" class="page-rotation">
            <label>Página:</label>
            <input type="number" v-model.number="rotation.page" min="1" placeholder="Número da página" />

            <label>Rotação:</label>
            <select v-model.number="rotation.degrees">
              <option :value="0">0°</option>
              <option :value="90">90°</option>
              <option :value="180">180°</option>
              <option :value="270">270°</option>
            </select>

            <button @click="removeRotation(index)">Remover</button>
          </div>
          <button @click="addRotation">Adicionar Página</button>
        </div>
      </div>
      
      <!-- Split PDF Tab -->
      <div v-if="activeTab === 'split'" class="tab-content">
        <h3>Dividir PDF</h3>
        <div class="split-controls">
          <label>Pontos de divisão (números das páginas):</label>
          <input v-model="splitPointsInput" placeholder="Ex: 1, 3, 5" />
          <p><small>Separe os números com vírgulas</small></p>
        </div>
      </div>
      
      <!-- Extract Pages Tab -->
      <!-- <div v-if="activeTab === 'extract'" class="tab-content">
        <h3>Extrair Páginas</h3>
        <div class="extract-controls">
          <label>Páginas a extrair:</label>
          <input v-model="extractPagesInput" placeholder="Ex: 1, 3, 5-10" />
          <p><small>Separe os números com vírgulas, use hífen para intervalos</small></p>
        </div>
      </div> -->
      
      <!-- Add Watermark Tab -->
      <div v-if="activeTab === 'watermark'" class="tab-content">
        <h3>Adicionar Marca d'Água</h3>
        <div class="watermark-controls">
          <label>Texto da marca d'água:</label>
          <input v-model="watermarkText" placeholder="Digite o texto da marca d'água" />
          
          <label>Ou envie uma imagem para marca d'água:</label>
          <input type="file" accept="image/*" @change="handleWatermarkImage" />
          <div v-if="watermarkImagePreview" style="margin-top: 10px;">
            <strong>Preview da imagem:</strong><br />
            <img :src="watermarkImagePreview" alt="Preview da marca d'água" style="width: 150px; height: 150px; object-fit: contain;" />
            <div>
              <label>Largura da imagem:</label>
              <input type="number" v-model.number="watermarkImageWidth" min="1" max="1000" />
              <label>Altura da imagem:</label>
              <input type="number" v-model.number="watermarkImageHeight" min="1" max="1000" />
            </div>
            <button @click="removeWatermarkImage">Remover imagem</button>
          </div>

          <label>Opacidade:</label>
          <input type="range" v-model.number="watermarkOpacity" min="0" max="1" step="0.1" />
          <span>{{ Math.round(watermarkOpacity * 100) }}%</span>
          
          <label>Posição:</label>
          <select v-model="watermarkPosition">
            <option value="center">Centro</option>
            <option value="top-left">Superior Esquerda</option>
            <option value="top-right">Superior Direita</option>
            <option value="bottom-left">Inferior Esquerda</option>
            <option value="bottom-right">Inferior Direita</option>
          </select>
        </div>
      </div>
      
      <!-- Remove Pages Tab -->
      <div v-if="activeTab === 'removePages'" class="tab-content">
        <h3>Remover Páginas</h3>
        <div class="remove-pages-controls">
          <label>Páginas a remover:</label>
          <input v-model="removePagesInput" placeholder="Ex: 1, 3, 5-10" />
          <p><small>Separe os números com vírgulas, use hífen para intervalos</small></p>
        </div>
      </div>
      
      
      
      <!-- Add Annotations Tab -->
      <div v-if="activeTab === 'addAnnotations'" class="tab-content">
        <h3>Adicionar Anotações</h3>
        <div class="annotations-controls">
          <div class="comment-controls">
            <div class="form-group">
              <label>Página:</label>
              <input type="number" v-model.number="commentPage" min="1" placeholder="Número da página" />
            </div>
            
            <div class="form-group">
              <label>Coordenadas (X, Y):</label>
              <div class="coordinate-inputs">
                <input type="number" v-model.number="commentX" placeholder="X" />
                <input type="number" v-model.number="commentY" placeholder="Y" />
              </div>
            </div>
            
            <div class="form-group">
              <label>Conteúdo do Comentário:</label>
              <textarea v-model="commentContent" placeholder="Digite seu comentário"></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Cor do Texto:</label>
                <input type="color" v-model="commentTextColor" />
                <span class="color-preview" :style="{ backgroundColor: commentTextColor }"></span>
              </div>
              
              <div class="form-group">
                <label>Cor de Fundo:</label>
                <input type="color" v-model="commentBgColor" />
                <span class="color-preview" :style="{ backgroundColor: commentBgColor }"></span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Tamanho da Fonte:</label>
              <input type="range" v-model.number="commentFontSize" min="8" max="32" step="1" />
              <span>{{ commentFontSize }}px</span>
            </div>
            
            <div class="form-group">
              <label>Largura da Caixa:</label>
              <input type="range" v-model.number="commentBoxWidth" min="100" max="500" step="10" />
              <span>{{ commentBoxWidth }}px</span>
            </div>
            
            <button @click="addComment" class="primary-btn">Adicionar Comentário</button>
          </div>
        </div>
      </div>

      
    </div>

    <div v-if="processing" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <button @click="processPdf" :disabled="!file || processing">
      {{ processing ? 'Processando...' : 'Processar PDF' }}
    </button>

    <AdBanner v-if="!result" size="300x250" />

    <div v-if="result" class="result">
      <h3>✅ PDF processado com sucesso!</h3>
      <a :href="result.url" target="_blank" download="pdf-processado.pdf" class="download-btn">
        Baixar PDF
      </a>
    </div>
    
    <div v-if="error" class="error">
      <h3>❌ Erro ao processar o PDF</h3>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import axios from 'axios';
import FileDrop from '@/components/FileDrop.vue';
import AdBanner from '@/components/AdBanner.vue';
import { useHead } from '@vueuse/head';

// Estados principais
const file = ref(null);
const activeTab = ref('rotate');
const progress = ref(0);
const processing = ref(false);
const result = ref(null);
const error = ref(null);
const pdfUrl = ref(null);

const tabs = [
  { id: 'rotate', label: 'Rotacionar' },
  { id: 'split', label: 'Dividir' },
  // { id: 'extract', label: 'Extrair' },
  { id: 'watermark', label: 'Marca d\'Água' },
  { id: 'removePages', label: 'Remover Páginas' },
  { id: 'addAnnotations', label: 'Anotações' },
];

// Estados para operações
const rotations = ref([]);
const splitPointsInput = ref('');
const extractPagesInput = ref('');
const removePagesInput = ref('');
const watermarkText = ref('');
const watermarkOpacity = ref(0.5);
const watermarkPosition = ref('center');
const watermarkImageFile = ref(null);
const watermarkImagePreview = ref(null);
const watermarkImageWidth = ref(150);
const watermarkImageHeight = ref(150);

// Estados para anotações
const commentPage = ref(1);
const commentX = ref(100);
const commentY = ref(100);
const commentContent = ref('');
const commentTextColor = ref('#000000');
const commentBgColor = ref('#ffffff');
const commentFontSize = ref(12);
const commentBoxWidth = ref(200);

// Quando usuário escolhe arquivo
function handleFile(selectedFile) {
  file.value = selectedFile;
  
  // Cria URL para preview do PDF
  if (selectedFile) {
    pdfUrl.value = URL.createObjectURL(selectedFile);
  } else {
    pdfUrl.value = null;
  }

  // Reset estados
  result.value = null;
  error.value = null;
  progress.value = 0;
  activeTab.value = 'rotate';

  rotations.value = [];
  splitPointsInput.value = '';
  extractPagesInput.value = '';
  removePagesInput.value = '';
  watermarkText.value = '';
  watermarkOpacity.value = 0.5;
  watermarkPosition.value = 'center';
  watermarkImageFile.value = null;
  watermarkImagePreview.value = null;
  watermarkImageWidth.value = 150;
  watermarkImageHeight.value = 150;
  
  // Reset anotações
  commentPage.value = 1;
  commentX.value = 100;
  commentY.value = 100;
  commentContent.value = '';
  commentFontSize.value = 12;
  commentBoxWidth.value = 200;
  
}

useHead({
  title: 'Editor de PDF Online - SmartFiles',
  meta: [
    { name: 'description', content: 'Rotacione, divida, extraia páginas, adicione marca d’água e mais. Editor de PDF online gratuito.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://www.smartfiles.app/pdf-editor' }
  ]
});

// Interpreta intervalos de páginas como "1-3,5,7-9"
function parsePageRanges(input) {
  const resultSet = new Set();
  if (!input) return [];

  input.split(',').forEach(part => {
    part = part.trim();
    if (!part) return;

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Number(startStr);
      const end = Number(endStr);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          resultSet.add(i);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num)) {
        resultSet.add(num);
      }
    }
  });

  return Array.from(resultSet).sort((a, b) => a - b);
}

// Marca d'água: lidar com imagem
function handleWatermarkImage(event) {
  const selectedFile = event.target.files[0];
  if (!selectedFile) return;

  watermarkImageFile.value = selectedFile;
  const reader = new FileReader();
  reader.onload = e => {
    watermarkImagePreview.value = e.target.result;
  };
  reader.readAsDataURL(selectedFile);
}

function removeWatermarkImage() {
  watermarkImageFile.value = null;
  watermarkImagePreview.value = null;
}

// Edição de PDF
function addRotation() {
  rotations.value.push({ page: 1, degrees: 0 });
}

function removeRotation(index) {
  rotations.value.splice(index, 1);
}



// Adicionar comentário

function addComment() {
  console.log('Adicionando comentário:', {
    page: commentPage.value,
    x: commentX.value,
    y: commentY.value,
    content: commentContent.value,
    textColor: commentTextColor.value,
    bgColor: commentBgColor.value
  });
  
  if (!commentContent.value.trim()) {
    error.value = 'Preencha o conteúdo do comentário';
    return;
  }

  // Set the active tab to 'addAnnotations' to ensure the correct options are used
  activeTab.value = 'addAnnotations';
  
  // Call processPdf to handle the annotation addition
  processPdf();
}


// Envia para backend para processar PDF
async function processPdf() {
  console.log('Processando PDF com operação:', activeTab.value);

  if (!file.value) {
    error.value = 'Por favor, selecione um arquivo PDF.';
    return;
  }

  processing.value = true;
  progress.value = 0;
  result.value = null;
  error.value = null;

  try {
    const formData = new FormData();

    // Campo pdf (obrigatório)
    formData.append('pdf', file.value);

    // Operação (ex: addAnnotations, merge, watermark)
    formData.append('operation', activeTab.value);

    // Gera opções no formato correto
    const options = preparePdfOptions() || {};
    formData.append('options', JSON.stringify(options));

    // Se tiver imagem de marca d'água
    if (watermarkImageFile.value) {
      formData.append('watermarkImage', watermarkImageFile.value);
    }

    // 🚀 Mande para o backend real
    const response = await axios.post(
      import.meta.env.VITE_API_BASE_URL + '/api/edit-pdf', // Usando variável de ambiente
      formData,
      {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: updateProgress(0, 50),
        onDownloadProgress: updateProgress(50, 100),
      }
    );

    // Recebe PDF processado
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    result.value = { url };

    // Update preview for operations that return a single PDF
    // (not for split operation which returns a zip file)
    if (activeTab.value !== 'split') {
      // Revoke the old URL if it exists
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
      }
      // Update the preview with the processed PDF
      pdfUrl.value = url;
    } else {
      // For split operation, show a message that the result is a zip file
      error.value = 'O PDF foi dividido com sucesso. O resultado é um arquivo zip que pode ser baixado.';
    }

  } catch (err) {
    console.error('Erro ao processar arquivo:', err);
    if (err.response && err.response.data) {
      // Try to parse the error response as JSON
      try {
        const errorResponse = await err.response.data.text();
        const errorData = JSON.parse(errorResponse);
        error.value = `Erro: ${errorData.error || 'Erro desconhecido'}`;
      } catch (parseError) {
        // If parsing fails, use the raw response data
        error.value = `Erro: ${err.response.statusText || 'Erro desconhecido'}`;
      }
    } else {
      error.value = 'Erro ao processar PDF. Verifique os dados enviados.';
    }
  } finally {
    processing.value = false;
  }
}


function hexToRgb(hex) {
  hex = hex.replace('#','');
  const bigint = parseInt(hex, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
}


// Prepara opções para backend baseado na aba ativa
function preparePdfOptions() {
  switch (activeTab.value) {
    case 'rotate':
      if (rotations.value.length === 0) {
        error.value = 'Adicione pelo menos uma rotação.';
        return null;
      }
      return {
        rotations: rotations.value.map(r => ({
          page: r.page,
          degrees: Number(r.degrees),
        })),
      };

    case 'split':
      if (!splitPointsInput.value.trim()) {
        error.value = 'Informe os pontos de divisão.';
        return null;
      }
      return { splitPoints: parsePageRanges(splitPointsInput.value) };

    case 'extract':
      if (!extractPagesInput.value.trim()) {
        error.value = 'Informe as páginas a extrair.';
        return null;
      }
      return { pageNumbers: parsePageRanges(extractPagesInput.value) };

    case 'watermark':
      if (!watermarkText.value.trim() && !watermarkImageFile.value) {
        error.value = 'Informe o texto ou envie uma imagem para a marca d\'água.';
        return null;
      }
      return {
        watermarkText: watermarkText.value,
        opacity: watermarkOpacity.value,
        position: watermarkPosition.value,
        imageWidth: watermarkImageWidth.value,
        imageHeight: watermarkImageHeight.value,
      };

    case 'removePages':
      if (!removePagesInput.value.trim()) {
        error.value = 'Informe as páginas a remover.';
        return null;
      }
      return { pagesToRemove: parsePageRanges(removePagesInput.value) };

    case 'addAnnotations':
    if (!commentContent.value.trim()) {
      error.value = 'Informe o conteúdo do comentário.';
      return null;
    }

    return {
      comments: [
        {
          page: Number(commentPage.value),
          x: Number(commentX.value),
          y: Number(commentY.value),
          content: commentContent.value,
          textColor: hexToRgb(commentTextColor.value), // cor do texto
          bgColor: hexToRgb(commentBgColor.value),     // cor de fundo
          fontSize: Number(commentFontSize.value),
          width: Number(commentBoxWidth.value),
          height: 50   // altura fixa por enquanto
        }
      ]
    };

      default:
        error.value = 'Operação desconhecida.';
        return null;
    }
  }

// Atualiza barra de progresso do upload/download
function updateProgress(start, end) {
  return (e) => {
    if (e.lengthComputable) {
      progress.value = start + Math.round((e.loaded / e.total) * (end - start));
    }
  };
}

// Limpa recursos no unmount do componente
onBeforeUnmount(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }
  if (result.value?.url) {
    URL.revokeObjectURL(result.value.url);
  }
  if (watermarkImagePreview.value) {
    URL.revokeObjectURL(watermarkImagePreview.value);
  }
});
</script>

<style scoped>
.pdf-editor-page {
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
  min-height: 400px;
  background: #fff;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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

.editor-tabs {
  margin: 2rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.tab-buttons {
  display: flex;
  background: #f5f7fa;
  flex-wrap: wrap;
  border-bottom: 1px solid #e0e0e0;
}

.tab-buttons button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
  font-weight: 600;
  color: #555;
  border-bottom: 3px solid transparent;
}

.tab-buttons button:hover {
  background: #e9ecef;
  color: #333;
}

.tab-buttons button.active {
  background: #fff;
  color: #2a75ff;
  border-bottom: 3px solid #2a75ff;
}

.tab-content {
  padding: 1.5rem;
  background: #fff;
}

.tab-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.rotation-controls,
.split-controls,
.extract-controls,
.watermark-controls,
.remove-pages-controls,
.annotations-controls {
  margin: 1.5rem 0;
}

.page-rotation {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.page-rotation label {
  width: 100px;
  font-weight: 500;
}

.page-rotation select,
.page-rotation input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.comment-controls {
  margin: 1.5rem 0;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.comment-controls label {
  display: block;
  margin: 0.75rem 0 0.25rem 0;
  font-weight: 600;
  color: #444;
}

.comment-controls input,
.comment-controls textarea {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.comment-controls input:focus,
.comment-controls textarea:focus {
  border-color: #2a75ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(42, 117, 255, 0.2);
}

.comment-controls textarea {
  height: 100px;
  resize: vertical;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.coordinate-inputs {
  display: flex;
  gap: 0.5rem;
}

.coordinate-inputs input {
  flex: 1;
}

.color-preview {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-left: 0.5rem;
  vertical-align: middle;
}

input[type="range"] {
  width: 70%;
  margin-right: 1rem;
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
}

.error {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffe0e0, #ffd0d0);
  border-radius: 12px;
  border: 1px solid #ff0000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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

button:not(.tab-buttons button) {
  background: #2a75ff;
  color: white;
  box-shadow: 0 2px 6px rgba(42, 117, 255, 0.3);
}

button:not(.tab-buttons button):hover:not(:disabled) {
  background: #1a65e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(42, 117, 255, 0.4);
}

.annotation-preview {
  position: absolute;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  max-width: 200px;
  word-wrap: break-word;
  font-family: Arial, sans-serif;
  border: 1px solid rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}
</style>