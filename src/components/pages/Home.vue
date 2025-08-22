<template>
  <div class="home">
    <header class="hero">
      <div class="hero-banner">
        <div class="banner-content">
          <div class="banner-text">
            <h1>SmartFiles</h1>
            <p class="banner-subtitle">Ferramentas Inteligentes para suas Necessidades Digitais</p>
            <div class="banner-features">
              <span class="feature-tag">🚀 100% Gratuito</span>
              <span class="feature-tag">⚡ Processamento Rápido</span>
              <span class="feature-tag">🔒 Seguro e Privado</span>
            </div>
          </div>
          <div class="banner-cta">
            <p class="cta-text">Transforme seus arquivos em segundos</p>
            <button class="cta-button" @click="scrollToTools">
              Começar Agora
            </button>
          </div>
        </div>
        <div class="banner-decoration">
          <div class="floating-icon">📄</div>
          <div class="floating-icon">🖼️</div>
          <div class="floating-icon">📱</div>
          <div class="floating-icon">🤖</div>
        </div>
      </div>
    </header>

    <AdBanner size="728x90" />

    <div class="tools-grid">
      <ToolCard
        icon="📷"
        title="Comprimir Imagem"
        description="Reduza o tamanho sem perder qualidade"
        to="/compress"
        :badges="['50 MB', 'Sem marca d\'água', 'Rápido']"
      />
      <ToolCard
        icon="📄"
        title="Unir PDFs"
        description="Junte vários PDFs em um só"
        to="/merge"
        :badges="['50 MB', 'Sem marca d\'água', 'Rápido']"
      />
      <ToolCard
        icon="🖼️"
        title="Converter Imagem"
        description="Converta entre formatos (JPG, PNG, WEBP, etc.)"
        to="/convert"
        :badges="['50 MB', 'Sem marca d\'água', 'Rápido']"
      />
      <ToolCard
        icon="📐"
        title="Redimensionar Imagem"
        description="Altere dimensões (pixels) sem perder qualidade"
        to="/resize"
        :badges="['50 MB', 'Sem marca d\'água', 'Rápido']"
      />
      <ToolCard
        icon="✏️"
        title="Editor de PDF"
        description="Rotacione, divida, extraia páginas ou adicione marcas d'água"
        to="/pdf-editor"
        :badges="['50 MB', 'Sem marca d\'água', 'Rápido']"
      />
      <ToolCard
        icon="🔐"
        title="Adicionar Senha ao PDF"
        description="Proteja seus PDFs aplicando uma senha"
        to="/add-pdf-password"
        :badges="['50 MB', 'Seguro', 'Rápido']"
      />
       <ToolCard
         icon="📱"
         title="Gerar QR Code"
         description="Crie códigos QR a partir de URLs ou textos"
         to="/qr-code"
         :badges="['Gratuito', 'PNG/SVG', 'Rápido']"
       />
      <ToolCard
        icon="📄"
        title="Gerador de PDF"
        description="Crie PDFs profissionais com texto, imagens ou tabelas"
        to="/pdf-generator"
        :badges="['Gratuito', 'Fácil de usar', 'Rápido']"
      />
      <ToolCard
        icon="🤖"
        title="Ferramentas IA"
        description="PDF Inteligente e Texto Inteligente com IA"
        to="/ia-tools"
        :badges="['Gratuito', 'Inovador', 'Rápido']"
      />
    </div>
  </div>
</template>

<script setup>
import ToolCard from '@/components/ToolCard.vue';
import AdBanner from '@/components/AdBanner.vue';
import { useHead } from '@vueuse/head';

const scrollToTools = () => {
  const toolsSection = document.querySelector('.tools-grid');
  if (toolsSection) {
    toolsSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

useHead({
  title: 'SmartFiles - Ferramentas Inteligentes para Arquivos',
  meta: [
    { name: 'description', content: 'Comprimir imagens, unir PDFs, converter documentos, editar PDFs, gerar QR Code e mais. Rápido, seguro e gratuito.' },
    { property: 'og:title', content: 'SmartFiles - Ferramentas Inteligentes para Arquivos' },
    { property: 'og:description', content: 'Ferramentas online para compressão, conversão e edição de arquivos.' },
    { property: 'og:type', content: 'website' }
  ],
  link: [
    { rel: 'canonical', href: 'https://www.smartfiles.app/' }
  ]
});
</script>

<style scoped>
.home {
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  margin-bottom: 3rem;
}

.hero-banner {
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: linear-gradient(274deg, #667eea 0%, #af2de6 100%);
  border-radius: 20px;
  padding: 3rem 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  color: white;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.banner-text h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.banner-subtitle {
  font-size: 1.3rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  font-weight: 300;
}

.banner-features {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.feature-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.banner-cta {
  text-align: center;
}

.cta-text {
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.cta-button {
  background: linear-gradient(45deg, #cbbcd1, #af2de6);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
  background: linear-gradient(45deg, var(--color1), var(--color2));
}

.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.floating-icon {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.floating-icon:nth-child(1) {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-icon:nth-child(2) {
  top: 60%;
  right: 15%;
  animation-delay: 1.5s;
}

.floating-icon:nth-child(3) {
  bottom: 30%;
  left: 20%;
  animation-delay: 3s;
}

.floating-icon:nth-child(4) {
  top: 40%;
  right: 30%;
  animation-delay: 4.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
  
  .banner-text h1 {
    font-size: 2.5rem;
  }
  
  .banner-subtitle {
    font-size: 1.1rem;
  }
  
  .banner-features {
    justify-content: center;
  }
  
  .hero-banner {
    padding: 2rem 1rem;
  }
  
  .floating-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .banner-text h1 {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1rem;
  }
  
  .feature-tag {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
  
  .cta-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
}
</style>