<template>
  <div class="termos-container">
    <div class="termos-content">
      <h1>Termos de Uso</h1>
      <p class="last-updated">Última atualização: {{ new Date().toLocaleDateString('pt-BR') }}</p>

      <section class="termos-section">
        <h2>1. Aceitação dos Termos</h2>
        <p>Ao acessar e usar o SmartFiles, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.</p>
      </section>

      <section class="termos-section">
        <h2>2. Descrição do Serviço</h2>
        <p>O SmartFiles é uma plataforma online que oferece ferramentas gratuitas para:</p>
        <ul>
          <li>Compressão e conversão de imagens</li>
          <li>Edição e manipulação de arquivos PDF</li>
          <li>Geração de códigos QR</li>
          <li>Recuperação de arquivos</li>
          <li>Conversão de documentos</li>
          <li>Ferramentas de inteligência artificial</li>
        </ul>
      </section>

      <section class="termos-section">
        <h2>3. Uso Aceitável</h2>
        <p>Você concorda em usar nossos serviços apenas para fins legais e de acordo com estes Termos. Você não deve:</p>
        <ul>
          <li>Usar os serviços para atividades ilegais ou fraudulentas</li>
          <li>Fazer upload de conteúdo que viole direitos autorais ou propriedade intelectual</li>
          <li>Tentar acessar ou interferir na segurança do sistema</li>
          <li>Usar bots ou scripts automatizados sem autorização</li>
          <li>Compartilhar conteúdo malicioso ou prejudicial</li>
        </ul>
      </section>

      <section class="termos-section">
        <h2>4. Privacidade e Dados</h2>
        <p>Seu uso dos serviços está sujeito à nossa <router-link to="/privacidade">Política de Privacidade</router-link>. Os arquivos que você faz upload são processados temporariamente e não são armazenados permanentemente em nossos servidores.</p>
      </section>

      <section class="termos-section">
        <h2>5. Limitações de Responsabilidade</h2>
        <p>O SmartFiles é fornecido "como está" sem garantias de qualquer tipo. Não nos responsabilizamos por:</p>
        <ul>
          <li>Perda de dados durante o processamento</li>
          <li>Interrupções no serviço</li>
          <li>Danos indiretos ou consequenciais</li>
          <li>Resultados inadequados do processamento de arquivos</li>
        </ul>
      </section>

      <section class="termos-section">
        <h2>6. Propriedade Intelectual</h2>
        <p>Todo o conteúdo do SmartFiles, incluindo mas não se limitando a textos, gráficos, logos e software, é propriedade nossa ou de nossos licenciadores e está protegido por leis de direitos autorais.</p>
      </section>

      <section class="termos-section">
        <h2>7. Modificações dos Termos</h2>
        <p>Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As modificações entrarão em vigor imediatamente após sua publicação. Recomendamos que você revise periodicamente estes termos.</p>
      </section>

      <section class="termos-section">
        <h2>8. Rescisão</h2>
        <p>Podemos encerrar ou suspender seu acesso aos serviços imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes Termos de Uso.</p>
      </section>

      <section class="termos-section">
        <h2>9. Lei Aplicável</h2>
        <p>Estes Termos de Uso são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais competentes do Brasil.</p>
      </section>

      <section class="termos-section">
        <h2>10. Contato</h2>
        <p>Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através da nossa página de <router-link to="/contato">Contato</router-link>.</p>
      </section>

      <div class="termos-footer">
        <p><strong>SmartFiles</strong> - Ferramentas inteligentes para suas necessidades digitais</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente de Termos de Uso
</script>

<style scoped>
.termos-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.termos-content h1 {
  color: var(--color1);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.last-updated {
  color: #666;
  text-align: center;
  font-style: italic;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.termos-section {
  margin-bottom: 2rem;
}

.termos-section h2 {
  color: var(--color2);
  font-size: 1.4rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.termos-section p {
  line-height: 1.7;
  color: #333;
  margin-bottom: 1rem;
}

.termos-section ul {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.termos-section li {
  line-height: 1.6;
  color: #555;
  margin-bottom: 0.5rem;
}

.termos-section a {
  color: var(--color1);
  text-decoration: none;
  font-weight: 500;
}

.termos-section a:hover {
  text-decoration: underline;
}

.termos-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .termos-container {
    padding: 1rem;
    margin: 1rem;
  }
  
  .termos-content h1 {
    font-size: 2rem;
  }
  
  .termos-section h2 {
    font-size: 1.2rem;
  }
}
</style>
