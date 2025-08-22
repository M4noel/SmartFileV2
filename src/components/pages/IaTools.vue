<template>
  <div class="ia-tools-page">
    <div class="feature-badges">
      <span class="badge large-file">Até 50 MB por arquivo</span>
      <span class="badge no-watermark">Sem marca d'água</span>
      <span class="badge fast">Processamento em segundos</span>
    </div>
    
    <h1>🤖 SmartFiles IA</h1>
    <p class="subtitle">Potencialize seus documentos com tecnologia de ponta!</p>
    
    <div class="tools-container">
      <!-- PDF Inteligente Section -->
      <div class="tool-section">
        <div class="section-header">
          <h2>📄 PDF Inteligente</h2>
          <p>Resuma, pesquise, converse e edite seus PDFs com inteligência artificial</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Resumo Automático</h3>
            <p>Obtenha resumos concisos dos principais pontos do seu documento</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Pesquisa Inteligente</h3>
            <p>Encontre informações específicas em documentos longos rapidamente</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Chat com PDF</h3>
            <p>Converse diretamente com seu documento e faça perguntas</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">✏️</div>
            <h3>Edição Inteligente</h3>
            <p>Modifique seu PDF com comandos de voz ou texto</p>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            class="primary-btn tooltip-trigger" 
            @click="showComingSoonPopup('PDF Inteligente')"
            @mouseenter="showTooltip($event, 'Em breve: PDF Inteligente')"
            @mouseleave="hideTooltip"
          >
            Acessar PDF Inteligente
          </button>
        </div>
      </div>
      
      <!-- Texto Inteligente Section -->
      <div class="tool-section">
        <div class="section-header">
          <h2>🔤 Texto Inteligente</h2>
          <p>Reescreva, resuma e gere conteúdo com inteligência artificial</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Reescrita Inteligente</h3>
            <p>Reescreva textos mantendo o significado original</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Resumo de Texto</h3>
            <p>Transforme textos longos em resumos concisos</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">✨</div>
            <h3>Geração de Conteúdo</h3>
            <p>Crie novos conteúdos com base em instruções simples</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">✅</div>
            <h3>Correção Gramatical</h3>
            <p>Identifique e corrija erros gramaticais automaticamente</p>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            class="primary-btn tooltip-trigger" 
            @click="showComingSoonPopup('Texto Inteligente')"
            @mouseenter="showTooltip($event, 'Em breve: Texto Inteligente')"
            @mouseleave="hideTooltip"
          >
            Acessar Texto Inteligente
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tooltip -->
    <div v-if="tooltipVisible" class="tooltip" :style="tooltipStyle">
      {{ tooltipText }}
    </div>
    
    <!-- Popup Modal -->
    <div v-if="popupVisible" class="popup-overlay" @click="closePopup">
      <div class="popup-modal" @click.stop>
        <div class="popup-header">
          <h3>🚀 Em Breve!</h3>
          <button class="popup-close" @click="closePopup">×</button>
        </div>
        <div class="popup-content">
          <div class="popup-icon">🤖</div>
          <h4>{{ popupTitle }}</h4>
          <p>Estamos trabalhando para trazer essa funcionalidade incrível para você!</p>
          <p class="popup-features">
            <strong>Recursos que virão:</strong>
          </p>
          <ul class="popup-feature-list">
            <li>✨ Interface intuitiva e moderna</li>
            <li>⚡ Processamento rápido e eficiente</li>
            <li>🔒 Segurança e privacidade garantidas</li>
            <li>📱 Compatível com todos os dispositivos</li>
          </ul>
          <p class="popup-notification">
            <strong>💡 Dica:</strong> Deixe seu email para ser notificado quando estiver disponível!
          </p>
          <div class="popup-email-form">
            <input 
              type="email" 
              placeholder="Seu email" 
              v-model="emailNotification"
              class="popup-email-input"
            />
            <button class="popup-notify-btn" :disabled="submitting" @click="subscribeNotification">
              {{ submitting ? 'Enviando...' : 'Notificar-me' }}
            </button>
          </div>
          <div v-if="submitSuccessMessage" class="status-message success">{{ submitSuccessMessage }}</div>
          <div v-if="submitErrorMessage" class="status-message error">{{ submitErrorMessage }}</div>
        </div>
      </div>
    </div>
    
    <AdBanner size="300x250" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import AdBanner from '@/components/AdBanner.vue';

// Tooltip state
const tooltipVisible = ref(false);
const tooltipText = ref('');
const tooltipStyle = ref({});

// Popup state
const popupVisible = ref(false);
const popupTitle = ref('');
const emailNotification = ref('');
const submitting = ref(false);
const submitSuccessMessage = ref('');
const submitErrorMessage = ref('');

const showTooltip = (event, text) => {
  tooltipText.value = text;
  tooltipVisible.value = true;
  
  const rect = event.target.getBoundingClientRect();
  tooltipStyle.value = {
    left: rect.left + (rect.width / 2) + 'px',
    top: rect.top - 10 + 'px',
    transform: 'translateX(-50%) translateY(-100%)'
  };
};

const hideTooltip = () => {
  tooltipVisible.value = false;
};

const showComingSoonPopup = (title) => {
  popupTitle.value = title;
  popupVisible.value = true;
  document.body.style.overflow = 'hidden'; // Prevent background scroll
};

const closePopup = () => {
  popupVisible.value = false;
  document.body.style.overflow = ''; // Restore scroll
  emailNotification.value = '';
  submitting.value = false;
  submitSuccessMessage.value = '';
  submitErrorMessage.value = '';
};

const subscribeNotification = async () => {
  submitSuccessMessage.value = '';
  submitErrorMessage.value = '';
  if (!emailNotification.value || !emailNotification.value.includes('@')) {
    submitErrorMessage.value = 'Por favor, insira um email válido.';
    return;
  }
  submitting.value = true;
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    await axios.post(`${baseURL}/api/notify-ia-tools`, {
      email: emailNotification.value,
      feature: popupTitle.value || 'IA Tools'
    });
    submitSuccessMessage.value = 'Obrigado! Seu interesse foi registrado.';
  } catch (e) {
    submitErrorMessage.value = 'Não foi possível registrar seu interesse. Tente novamente mais tarde.';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.ia-tools-page {
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

.tools-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin: 2rem 0;
}

.tool-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.section-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.section-header p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature-card {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.feature-card p {
  color: #666;
  font-size: 0.95rem;
}

.action-buttons {
  text-align: center;
  margin-top: 2rem;
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
  position: relative;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #1a65e0, #0a55d0) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(42, 117, 255, 0.4) !important;
}

/* Tooltip Styles */
.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
  animation: tooltipFadeIn 0.2s ease-in-out;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-100%) scale(1);
  }
}

/* Popup Modal Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: overlayFadeIn 0.3s ease-in-out;
}

.popup-modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid #eee;
}

.popup-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.popup-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.popup-close:hover {
  background: #f0f0f0;
  color: #666;
}

.popup-content {
  padding: 2rem;
  text-align: center;
}

.popup-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.popup-content h4 {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.popup-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.popup-features {
  text-align: left;
  margin-bottom: 1rem;
}

.popup-feature-list {
  text-align: left;
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.popup-feature-list li {
  color: #666;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.popup-feature-list li:last-child {
  border-bottom: none;
}

.popup-notification {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #2a75ff;
}

.popup-email-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.popup-email-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.popup-email-input:focus {
  outline: none;
  border-color: #2a75ff;
  box-shadow: 0 0 0 2px rgba(42, 117, 255, 0.2);
}

.popup-notify-btn {
  background: linear-gradient(135deg, #2a75ff, #1a65e0);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.popup-notify-btn:hover {
  background: linear-gradient(135deg, #1a65e0, #0a55d0);
  transform: translateY(-1px);
}

.status-message {
  margin-top: 0.75rem;
  font-size: 0.95rem;
}
.status-message.success {
  color: #0f7b3e;
}
.status-message.error {
  color: #b00020;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-section {
    padding: 1.5rem;
  }
  
  .popup-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .popup-content {
    padding: 1.5rem;
  }
  
  .popup-email-form {
    flex-direction: column;
  }
}
</style>