<template>
  <div id="app">
    <!-- Header Profissional -->
    <header class="header">
      <div class="header-container">
        <!-- Logo e Nome -->
        <div class="logo-section">
          <router-link to="/" class="logo">
            <img src="/logo.png" alt="SmartFiles Logo" class="logo-icon" />
            
          </router-link>
        </div>

        <!-- Navegação Principal -->
        <nav class="main-nav">
          <div class="nav-links">
            <router-link to="/compress">Comprimir Imagens</router-link>
            <router-link to="/merge">Unir PDFs</router-link>
            <router-link to="/convert">Converter Imagens</router-link>
            <router-link to="/resize">Redimensionar</router-link>
            <router-link to="/pdf-editor">Editor PDF</router-link>
            <router-link to="/add-pdf-password">Adicionar Senha PDF</router-link>
            <router-link to="/pdf-generator">Gerador de PDF</router-link>
            <router-link to="/qr-code">QR Code</router-link>
            <router-link to="/ia-tools">IA Tools</router-link>
          </div>
        </nav>

        <!-- Menu Mobile -->
        <div class="mobile-menu-toggle" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Menu Mobile -->
      <div class="mobile-menu" :class="{ 'active': mobileMenuOpen }">
        <router-link to="/compress">Comprimir Imagens</router-link>
        <router-link to="/merge">Unir PDFs</router-link>
        <router-link to="/convert">Converter Imagens</router-link>
        <router-link to="/resize">Redimensionar Imagens</router-link>
        <router-link to="/pdf-editor">Editor de PDF</router-link>
        <router-link to="/add-pdf-password">Adicionar Senha PDF</router-link>
        <router-link to="/pdf-generator">Gerador de PDF</router-link>
        <router-link to="/qr-code">Gerar QR Code</router-link>
        <router-link to="/ia-tools">Ferramentas IA</router-link>
      </div>
    </header>

    <!-- Espaço para anúncios no topo -->
    <div class="top-ad">
      <AdBanner size="728x90" />
    </div>

    <!-- Conteúdo principal -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer Profissional -->
    <footer class="footer">
      <div class="footer-container">
        <!-- Seção Principal do Footer -->
        <div class="footer-main">
          <div class="footer-section">
            <h3>SmartFiles</h3>
            <p>Oferecemos ferramentas inteligentes online para facilitar suas tarefas diárias. Compressão de imagens, conversão de documentos, edição de PDFs, remoção de senhas e muito mais.</p>
            <div class="social-links">
              <a href="#" class="social-link" title="Facebook">
                <span>📘</span>
              </a>
              <a href="#" class="social-link" title="Twitter">
                <span>🐦</span>
              </a>
              <a href="#" class="social-link" title="Instagram">
                <span>📷</span>
              </a>
              <a href="#" class="social-link" title="LinkedIn">
                <span>💼</span>
              </a>
            </div>
          </div>

          <div class="footer-section">
            <h4>Ferramentas Populares</h4>
            <ul class="footer-links">
              <li><router-link to="/compress">Comprimir Imagens</router-link></li>
              <li><router-link to="/merge">Unir PDFs</router-link></li>
              <li><router-link to="/convert">Converter Imagens</router-link></li>
              <li><router-link to="/resize">Redimensionar Imagens</router-link></li>
              <li><router-link to="/pdf-editor">Editor de PDF</router-link></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Recursos</h4>
            <ul class="footer-links">
              <li><router-link to="/ia-tools">Ferramentas IA</router-link></li>
              <li><router-link to="/qr-code">Gerador QR Code</router-link></li>
              <li><router-link to="/file-recovery">Recuperar Arquivos</router-link></li>
              <li><router-link to="/add-pdf-password">Adicionar Senha PDF</router-link></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Suporte</h4>
            <ul class="footer-links">
              <li><a href="/ajuda">Central de Ajuda</a></li>
              <li><a href="/contato">Contato</a></li>
              <li><a href="/feedback">Enviar Feedback</a></li>
            </ul>
          </div>
        </div>

        <!-- Seção de Anúncio -->
        <div class="footer-ad-section">
          <AdBanner size="728x90" class="footer-ad" />
        </div>

        <!-- Seção Legal -->
        <div class="footer-legal">
          <div class="legal-links">
            <a href="/termos">Termos de Uso</a>
            <a href="/privacidade">Política de Privacidade</a>
          </div>
          <div class="copyright">
            <p>&copy; 2025 SmartFiles. Todos os direitos reservados.</p>
            <p>Desenvolvido com ❤️ para facilitar sua vida digital</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import AdBanner from '@/components/AdBanner.vue';

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header Styles */
.header {
 background: linear-gradient(135deg, #cbbcd1, var(--color2));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
    width: 87px;
  object-fit: contain;
  filter: brightness(1.1) contrast(1.1);
}

.logo-text {
  font-weight: 700;
}

/* Main Navigation */
.main-nav {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-links a:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}



/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.mobile-menu-toggle span {
  width: 25px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: 0.3s;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  background: var(--color2);
  padding: 1rem;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-menu.active {
  display: flex;
}

.mobile-menu a {
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: background 0.3s;
}

.mobile-menu a:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  background: var(--bg);
  width: 100%;
  box-sizing: border-box;
}

/* Top Ad */
.top-ad {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

/* Footer Styles */
.footer {
  /* background: linear-gradient(135deg, #2c3e50, #34495e); */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem 1rem;
}

/* Footer Main */
.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  color: #ecf0f1;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.footer-section h4 {
  color: #ecf0f1;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.footer-section p {
  color: #bdc3c7;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #3498db;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #3498db;
  transform: translateY(-3px);
}

.social-link span {
  font-size: 1.2rem;
}

/* Footer Ad Section */
.footer-ad-section {
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
}

/* Footer Legal */
.footer-legal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.legal-links {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.legal-links a {
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.legal-links a:hover {
  color: #3498db;
}

.copyright {
  text-align: right;
  color: #95a5a6;
  font-size: 0.9rem;
}

.copyright p {
  margin: 0.25rem 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-links {
    gap: 0.5rem;
  }
  
  .nav-links a {
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
  }
  
  .main-nav {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .footer-main {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-legal {
    flex-direction: column;
    text-align: center;
  }
  
  .legal-links {
    justify-content: center;
  }
  
  .copyright {
    text-align: center;
  }
  
  .main-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 1.2rem;
  }
  
  .legal-links {
    gap: 1rem;
  }
  
  .legal-links a {
    font-size: 0.8rem;
  }
}
</style>