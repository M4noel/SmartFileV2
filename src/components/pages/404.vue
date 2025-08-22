<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-code">
        <h1>404</h1>
      </div>
      <div class="error-message">
        <h2>Página não encontrada</h2>
        <p>Desculpe, a página que você está procurando não existe ou foi movida.</p>
      </div>
      
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary">Voltar para a página inicial</router-link>
        
        <div class="search-section">
          <h3>Buscar página</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="performSearch"
              placeholder="Digite o nome da página..."
            />
            <button @click="performSearch" class="btn btn-secondary">Buscar</button>
          </div>
        </div>
      </div>
      
      <div class="useful-links">
        <h3>Links úteis</h3>
        <div class="links-grid">
          <router-link to="/compress" class="link-card">Comprimir Imagens</router-link>
          <router-link to="/merge" class="link-card">Unir PDFs</router-link>
          <router-link to="/convert" class="link-card">Converter Imagens</router-link>
          <router-link to="/resize" class="link-card">Redimensionar Imagens</router-link>
          <router-link to="/pdf-editor" class="link-card">Editor de PDF</router-link>
          <router-link to="/document-converter" class="link-card">Converter Documentos</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');

const performSearch = () => {
  if (searchQuery.value.trim()) {
    // In a real application, this would perform an actual search
    // For now, we'll just show an alert
    alert(`Busca por: ${searchQuery.value}`);
    // Reset search
    searchQuery.value = '';
  }
};

// SEO functions
const updateMetaTags = () => {
  document.title = 'Página não encontrada - SmartFiles';
  
  // Remove existing meta tags
  const existingDescription = document.querySelector('meta[name="description"]');
  const existingRobots = document.querySelector('meta[name="robots"]');
  
  if (existingDescription) existingDescription.remove();
  if (existingRobots) existingRobots.remove();
  
  // Add new meta tags
  const descriptionMeta = document.createElement('meta');
  descriptionMeta.name = 'description';
  descriptionMeta.content = 'A página que você está procurando não foi encontrada. Volte para a página inicial ou use nossa ferramenta de busca para encontrar o que precisa.';
  document.head.appendChild(descriptionMeta);
  
  const robotsMeta = document.createElement('meta');
  robotsMeta.name = 'robots';
  robotsMeta.content = 'noindex, follow';
  document.head.appendChild(robotsMeta);
};

const removeMetaTags = () => {
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const robotsMeta = document.querySelector('meta[name="robots"]');
  
  if (descriptionMeta) descriptionMeta.remove();
  if (robotsMeta) robotsMeta.remove();
};

onMounted(() => {
  updateMetaTags();
});

onUnmounted(() => {
  removeMetaTags();
});
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
}

.error-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
  max-width: 800px;
  width: 100%;
  animation: fadeIn 0.6s ease-out;
}

.error-code h1 {
  font-size: 6rem;
  margin: 0;
  color: #667eea;
  animation: pulse 2s infinite;
}

.error-message h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.error-message p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.error-actions {
  margin: 2rem 0;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  margin: 0 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.search-section {
  margin: 2rem 0;
}

.search-section h3 {
  color: #333;
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.search-box input {
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 25px;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
  outline: none;
  transition: border-color 0.3s;
}

.search-box input:focus {
  border-color: #667eea;
}

.useful-links h3 {
  color: #333;
  margin-bottom: 1.5rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.link-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.link-card:hover {
  background: #667eea;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .error-content {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .error-code h1 {
    font-size: 4rem;
  }
  
  .error-message h2 {
    font-size: 1.5rem;
  }
  
  .btn {
    display: block;
    width: 80%;
    margin: 10px auto;
  }
  
  .search-box {
    flex-direction: column;
  }
  
  .search-box input {
    max-width: 100%;
  }
  
  .links-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}

@media (max-width: 480px) {
  .error-code h1 {
    font-size: 3rem;
  }
  
  .error-message h2 {
    font-size: 1.3rem;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>