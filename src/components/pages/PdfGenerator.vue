<template>
  <div class="pdf-generator-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>
    
    <h1>📄 Gerador de PDF Simples</h1>
    <p class="subtitle">Crie PDFs profissionais com texto, imagens ou tabelas em segundos!</p>
    
    <div class="content-editor">
      <div class="editor-section">
        <h3>Adicionar Conteúdo</h3>
        <div class="content-buttons">
          <button @click="addContent('text')" class="content-btn">
            <span class="btn-icon">📝</span>
            <span>Texto</span>
          </button>
          <button @click="addContent('image')" class="content-btn">
            <span class="btn-icon">🖼️</span>
            <span>Imagem</span>
          </button>
          <button @click="addContent('table')" class="content-btn">
            <span class="btn-icon">📊</span>
            <span>Tabela</span>
          </button>
        </div>
      </div>
      
      <!-- Content Items -->
      <div class="content-items">
        <div 
          v-for="(item, index) in contentItems" 
          :key="index" 
          class="content-item"
        >
          <div class="item-header">
            <span class="item-type">{{ getItemTypeLabel(item.type) }}</span>
            <button @click="removeContent(index)" class="remove-item-btn">Remover</button>
          </div>
          
          <!-- Text Content -->
          <div v-if="item.type === 'text'" class="text-content">
            <textarea 
              v-model="item.content" 
              placeholder="Digite seu conteúdo aqui..."
              rows="5"
            ></textarea>
          </div>
          
          <!-- Image Content -->
          <div v-if="item.type === 'image'" class="image-content">
            <div
              class="drop-zone"
              @dragover.prevent
              @dragenter.prevent
              @drop.prevent="(e) => handleImageDrop(e, index)"
              :class="{ 'drag-over': item.isDragging }"
            >
              <input
                type="file"
                :ref="el => imageInputs[index] = el"
                @change="(e) => handleImageSelect(e, index)"
                accept="image/*"
                style="display: none;"
              />
              <div @click="() => openImagePicker(index)" class="drop-zone-content">
                <div class="placeholder-icon">🖼️</div>
                <p v-if="!item.preview">Arraste e solte sua imagem aqui</p>
                <p v-else>Imagem selecionada</p>
                <p>ou</p>
                <button class="browse-btn">Selecionar Imagem</button>
                <p class="placeholder-subtext">Formatos suportados: JPG, PNG, WEBP</p>
              </div>
            </div>
            
            <div v-if="item.preview" class="image-preview">
              <img :src="item.preview" alt="Preview" />
            </div>
          </div>
          
          <!-- Table Content -->
          <div v-if="item.type === 'table'" class="table-content">
            <div class="table-controls">
              <label>Linhas:</label>
              <input type="number" v-model.number="item.rows" min="1" max="20" @change="() => generateTable(item)" />
              <label>Colunas:</label>
              <input type="number" v-model.number="item.cols" min="1" max="10" @change="() => generateTable(item)" />
              <button @click="() => generateTable(item)">Gerar Tabela</button>
            </div>
            
            <div v-if="item.data.length > 0" class="table-container">
              <table>
                <thead>
                  <tr>
                    <th v-for="(header, colIndex) in item.data[0]" :key="colIndex">
                      <input 
                        v-model="item.headers[colIndex]" 
                        placeholder="Cabeçalho"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in item.data" :key="rowIndex">
                    <td v-for="(cell, colIndex) in row" :key="colIndex">
                      <input 
                        v-model="item.data[rowIndex][colIndex]" 
                        placeholder="Conteúdo"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pdf-options">
      <h3>Opções do PDF</h3>
      <div class="options-grid">
        <div class="option-group">
          <label for="pdf-title">Título do PDF:</label>
          <input 
            id="pdf-title"
            v-model="pdfTitle" 
            placeholder="Digite o título do PDF"
          />
        </div>
        
        <div class="option-group">
          <label for="page-size">Tamanho da Página:</label>
          <select id="page-size" v-model="pageSize">
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="Letter">Carta</option>
            <option value="Legal">Ofício</option>
          </select>
        </div>
        
        <div class="option-group">
          <label for="font-size">Tamanho da Fonte:</label>
          <select id="font-size" v-model="fontSize">
            <option value="10">10pt</option>
            <option value="12">12pt</option>
            <option value="14">14pt</option>
            <option value="16">16pt</option>
            <option value="18">18pt</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="preview-section">
      <h3>Pré-visualização</h3>
      <div class="preview-content">
        <p v-if="contentItems.length === 0">Adicione conteúdo para ver a pré-visualização</p>
        <div v-else>
          <div v-for="(item, index) in contentItems" :key="index" class="preview-item">
            <h4>{{ getItemTypeLabel(item.type) }}</h4>
            <div v-if="item.type === 'text'">
              <p>{{ item.content || 'Texto não definido' }}</p>
            </div>
            <div v-if="item.type === 'image'">
              <img v-if="item.preview" :src="item.preview" alt="Preview" class="preview-image" />
              <p v-else>Sem imagem selecionada</p>
            </div>
            <div v-if="item.type === 'table'">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th v-for="(header, colIndex) in item.headers" :key="colIndex">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in item.data" :key="rowIndex">
                    <td v-for="(cell, colIndex) in row" :key="colIndex">
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="processing" class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
    
    <button
      @click="generatePdf"
      :disabled="processing || contentItems.length === 0"
      class="primary-btn generate-pdf-btn"
    >
      {{ processing ? 'Gerando PDF...' : 'Gerar PDF' }}
    </button>
    
    <AdBanner v-if="!result" size="300x250" />
    
    <div v-if="result" class="result">
      <h3>✅ PDF gerado com sucesso!</h3>
      <p>Seu PDF está pronto para download.</p>
      <a :href="result.url" download="documento.pdf" class="download-btn">
        Baixar PDF
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import AdBanner from '@/components/AdBanner.vue';

// State variables
const contentItems = ref([]);
const imageInputs = ref([]);
const pdfTitle = ref('');
const pageSize = ref('A4');
const fontSize = ref('12');
const processing = ref(false);
const progress = ref(0);
const result = ref(null);

// Methods
const addContent = (type) => {
  const newItem = {
    type,
    id: Date.now() // Unique ID for each item
  };
  
  switch (type) {
    case 'text':
      newItem.content = '';
      break;
    case 'image':
      newItem.preview = null;
      newItem.file = null;
      newItem.isDragging = false;
      break;
    case 'table':
      newItem.rows = 3;
      newItem.cols = 3;
      newItem.data = [];
      newItem.headers = [];
      // Initialize table
      for (let i = 0; i < newItem.cols; i++) {
        newItem.headers.push(`Coluna ${i + 1}`);
      }
      for (let i = 0; i < newItem.rows; i++) {
        const row = [];
        for (let j = 0; j < newItem.cols; j++) {
          row.push('');
        }
        newItem.data.push(row);
      }
      break;
  }
  
  contentItems.value.push(newItem);
};

const removeContent = (index) => {
  contentItems.value.splice(index, 1);
};

const getItemTypeLabel = (type) => {
  switch (type) {
    case 'text': return 'Texto';
    case 'image': return 'Imagem';
    case 'table': return 'Tabela';
    default: return 'Conteúdo';
  }
};

const openImagePicker = (index) => {
  imageInputs.value[index].click();
};

const handleImageSelect = (event, index) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      contentItems.value[index].preview = e.target.result;
      contentItems.value[index].file = file;
    };
    reader.readAsDataURL(file);
  }
};

const handleImageDrop = (event, index) => {
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      contentItems.value[index].preview = e.target.result;
      contentItems.value[index].file = file;
    };
    reader.readAsDataURL(file);
  }
};

const generateTable = (item) => {
  // Clear existing data
  item.data = [];
  item.headers = [];
  
  // Initialize headers
  for (let i = 0; i < item.cols; i++) {
    item.headers.push(`Coluna ${i + 1}`);
  }
  
  // Initialize table data
  for (let i = 0; i < item.rows; i++) {
    const row = [];
    for (let j = 0; j < item.cols; j++) {
      row.push('');
    }
    item.data.push(row);
  }
};

const generatePdf = async () => {
  if (contentItems.value.length === 0) return;
  
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
  
  // Add PDF options
  formData.append('title', pdfTitle.value);
  formData.append('pageSize', pageSize.value);
  formData.append('fontSize', fontSize.value);
  
  // Add content items
  const contentData = contentItems.value.map(item => {
    return {
      type: item.type,
      content: item.type === 'text' ? item.content : undefined,
      tableData: item.type === 'table' ? item.data : undefined,
      tableHeaders: item.type === 'table' ? item.headers : undefined
    };
  });
  
  formData.append('contentData', JSON.stringify(contentData));
  
  // Add image files
  contentItems.value.forEach((item, index) => {
    if (item.type === 'image' && item.file) {
      formData.append(`image_${index}`, item.file);
    }
  });
  
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    const response = await axios.post(`${baseURL}/api/generate-combined-pdf`, formData, {
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
    alert('Erro ao gerar PDF: ' + (error.response?.data?.error || error.message));
  } finally {
    clearInterval(progressInterval);
    processing.value = false;
  }
};
</script>

<style scoped>
.pdf-generator-page {
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

.content-editor {
  margin: 2rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  background: #fff;
}

.editor-section {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.editor-section h3 {
  margin-top: 0;
  color: #333;
}

.content-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.content-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f5f7fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  color: #555;
}

.content-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.content-items {
  padding: 1.5rem;
}

.content-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.item-type {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.remove-item-btn {
  padding: 0.5rem 1rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  font-weight: 600;
}

.remove-item-btn:hover {
  background: #ff5252;
  transform: scale(1.05);
}

.text-content textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
}

.image-content {
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

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 1px solid #eee;
}

.table-content {
  margin: 1rem 0;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.table-controls label {
  font-weight: 600;
  color: #333;
}

.table-controls input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 60px;
}

.table-controls button {
  padding: 0.5rem 1rem;
  background: #2a75ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.table-controls button:hover {
  background: #1a65e0;
  transform: translateY(-1px);
}

.table-container {
  overflow-x: auto;
}

.table-container table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.table-container th,
.table-container td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

.table-container th {
  background: #f5f7fa;
  font-weight: 600;
}

.table-container input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.pdf-options {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.pdf-options h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.option-group {
  display: flex;
  flex-direction: column;
}

.option-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.option-group input,
.option-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
}

.preview-section {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.preview-section h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.preview-content {
  min-height: 100px;
}

.preview-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.preview-item h4 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
}

.preview-table th,
.preview-table td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

.preview-table th {
  background: #f5f7fa;
  font-weight: 600;
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

.generate-pdf-btn {
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

.generate-pdf-btn:disabled {
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

/* Responsive Design */
@media (max-width: 768px) {
  .pdf-generator-page {
    padding: 1rem;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .content-buttons {
    flex-direction: column;
  }
  
  .table-controls {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>