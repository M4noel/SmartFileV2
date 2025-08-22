<template>
  <div class="extras-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>
    
    <h1>📄 SmartFiles</h1>
    <p class="subtitle">Confira todas as funcionalidades disponíveis em nossa plataforma:</p>
    
    <div class="tools-grid">
      <div class="tool-card" @click="navigateTo('/compress')">
        <div class="tool-icon">📷</div>
        <h3>Comprimir Imagem</h3>
        <p>Comprima suas imagens mantendo qualidade</p>
      </div>
      
      <div class="tool-card" @click="navigateTo('/merge')">
        <div class="tool-icon">📄</div>
        <h3>Unir PDFs</h3>
        <p>Combine vários arquivos PDF em um só</p>
      </div>
      
      <div class="tool-card" @click="navigateTo('/convert')">
        <div class="tool-icon">🔄</div>
        <h3>Converter Imagens</h3>
        <p>Converta imagens entre formatos JPG, PNG, WebP</p>
      </div>
      
      <div class="tool-card" @click="navigateTo('/resize')">
        <div class="tool-icon">📏</div>
        <h3>Redimensionar</h3>
        <p>Ajuste o tamanho das suas imagens</p>
      </div>
      
             <div class="tool-card" @click="navigateTo('/pdf-editor')">
         <div class="tool-icon">✏️</div>
         <h3>Editor de PDF</h3>
         <p>Edite seus PDFs com várias ferramentas</p>
       </div>
       
       <div class="tool-card" @click="navigateTo('/add-pdf-password')">
         <div class="tool-icon">🔐</div>
         <h3>Adicionar Senha ao PDF</h3>
         <p>Proteja seus PDFs aplicando uma senha</p>
       </div>
    </div>
    
    <div class="feedback-section">
      <h2>Deixe seu comentário ou sugestão:</h2>
      <form class="comment-form" @submit.prevent="submitComment">
        <div class="form-group">
          <label for="name">Seu nome:</label>
          <input type="text" id="name" v-model="name" placeholder="Digite seu nome" required>
        </div>
        
        <div class="form-group">
          <label for="comment">Comentário:</label>
          <textarea id="comment" v-model="comment" placeholder="Digite seu comentário" required></textarea>
        </div>
        
        <button type="submit" class="primary-btn">Enviar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const name = ref('');
const comment = ref('');
const router = useRouter();

function submitComment() {
  if (!name.value || !comment.value) return;
  
  alert(`Obrigado, ${name.value}! Seu comentário foi enviado.`);
  
  // Aqui você pode adicionar a lógica para enviar para API ou salvar
  name.value = '';
  comment.value = '';
}

function navigateTo(path) {
  router.push(path);
}
</script>

<style scoped>
.extras-page {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.tool-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border-color: #007bff;
}

.tool-card h3 {
  margin-top: 0;
  color: #007bff;
}

.feedback-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comment-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

input, textarea {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
