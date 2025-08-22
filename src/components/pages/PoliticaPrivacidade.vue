<template>
  <div class="privacidade-container">
    <div class="privacidade-content">
      <h1>Política de Privacidade</h1>
      <p class="last-updated">Última atualização: {{ new Date().toLocaleDateString('pt-BR') }}</p>

      <section class="privacidade-section">
        <h2>1. Informações Gerais</h2>
        <p>O SmartFiles ("nós", "nosso" ou "a plataforma") está comprometido em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos e protegemos suas informações quando você usa nossos serviços.</p>
      </section>

      <section class="privacidade-section">
        <h2>2. Informações que Coletamos</h2>
        <h3>2.1 Informações de Uso</h3>
        <ul>
          <li>Dados de navegação (páginas visitadas, tempo de permanência)</li>
          <li>Informações do dispositivo (tipo de navegador, sistema operacional)</li>
          <li>Endereço IP e localização geográfica aproximada</li>
          <li>Cookies e tecnologias similares</li>
        </ul>

        <h3>2.2 Arquivos Processados</h3>
        <ul>
          <li>Arquivos que você faz upload para processamento</li>
          <li>Os arquivos são processados temporariamente e não são armazenados permanentemente</li>
          <li>Após o processamento, os arquivos são automaticamente excluídos de nossos servidores</li>
        </ul>
      </section>

      <section class="privacidade-section">
        <h2>3. Como Usamos Suas Informações</h2>
        <p>Utilizamos suas informações para:</p>
        <ul>
          <li>Fornecer e melhorar nossos serviços</li>
          <li>Processar seus arquivos conforme solicitado</li>
          <li>Analisar o uso da plataforma para otimização</li>
          <li>Detectar e prevenir atividades fraudulentas</li>
          <li>Cumprir obrigações legais</li>
          <li>Enviar comunicações importantes sobre o serviço</li>
        </ul>
      </section>

      <section class="privacidade-section">
        <h2>4. Compartilhamento de Informações</h2>
        <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:</p>
        <ul>
          <li>Quando exigido por lei ou ordem judicial</li>
          <li>Para proteger nossos direitos e segurança</li>
          <li>Com prestadores de serviços confiáveis que nos ajudam a operar a plataforma</li>
          <li>Com seu consentimento explícito</li>
        </ul>
      </section>

      <section class="privacidade-section">
        <h2>5. Cookies e Tecnologias de Rastreamento</h2>
        <p>Utilizamos cookies e tecnologias similares para:</p>
        <ul>
          <li>Lembrar suas preferências</li>
          <li>Analisar o tráfego do site</li>
          <li>Personalizar sua experiência</li>
          <li>Melhorar a funcionalidade da plataforma</li>
        </ul>
        <p>Você pode controlar o uso de cookies através das configurações do seu navegador.</p>
      </section>

      <section class="privacidade-section">
        <h2>6. Segurança dos Dados</h2>
        <p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:</p>
        <ul>
          <li>Criptografia SSL/TLS para transmissão de dados</li>
          <li>Processamento temporário de arquivos</li>
          <li>Exclusão automática de dados após processamento</li>
          <li>Monitoramento contínuo de segurança</li>
          <li>Controles de acesso rigorosos</li>
        </ul>
      </section>

      <section class="privacidade-section">
        <h2>7. Retenção de Dados</h2>
        <p>Seus dados são retidos apenas pelo tempo necessário:</p>
        <ul>
          <li><strong>Arquivos processados:</strong> Excluídos imediatamente após o processamento</li>
          <li><strong>Dados de uso:</strong> Retidos por até 12 meses para análise</li>
          <li><strong>Logs de segurança:</strong> Retidos por até 6 meses</li>
        </ul>
      </section>

      <section class="privacidade-section">
        <h2>8. Seus Direitos</h2>
        <p>Você tem os seguintes direitos relacionados aos seus dados:</p>
        <ul>
          <li><strong>Acesso:</strong> Solicitar informações sobre dados que coletamos</li>
          <li><strong>Correção:</strong> Solicitar correção de dados imprecisos</li>
          <li><strong>Exclusão:</strong> Solicitar exclusão de seus dados pessoais</li>
          <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
          <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
        </ul>
      </section>

      <section class="privacidade-section">
        <h2>9. Transferências Internacionais</h2>
        <p>Seus dados podem ser processados em servidores localizados em diferentes países. Garantimos que essas transferências sejam feitas em conformidade com as leis de proteção de dados aplicáveis.</p>
      </section>

      <section class="privacidade-section">
        <h2>10. Menores de Idade</h2>
        <p>Nossos serviços não são destinados a menores de 13 anos. Não coletamos intencionalmente informações pessoais de menores de 13 anos. Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco.</p>
      </section>

      <section class="privacidade-section">
        <h2>11. Alterações na Política</h2>
        <p>Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através de:</p>
        <ul>
          <li>Notificação na plataforma</li>
          <li>Email (se fornecido)</li>
          <li>Atualização da data de "Última atualização"</li>
        </ul>
      </section>

      <section class="privacidade-section">
        <h2>12. Contato</h2>
        <p>Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco:</p>
        <div class="contact-info">
          <p><strong>Email:</strong> privacidade@smartfiles.com</p>
          <p><strong>Formulário:</strong> <router-link to="/contato">Página de Contato</router-link></p>
        </div>
      </section>

      <div class="privacidade-footer">
        <p><strong>SmartFiles</strong> - Comprometidos com sua privacidade e segurança</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente de Política de Privacidade
</script>

<style scoped>
.privacidade-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.privacidade-content h1 {
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

.privacidade-section {
  margin-bottom: 2rem;
}

.privacidade-section h2 {
  color: var(--color2);
  font-size: 1.4rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.privacidade-section h3 {
  color: var(--color3);
  font-size: 1.1rem;
  margin: 1rem 0 0.5rem 0;
}

.privacidade-section p {
  line-height: 1.7;
  color: #333;
  margin-bottom: 1rem;
}

.privacidade-section ul {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.privacidade-section li {
  line-height: 1.6;
  color: #555;
  margin-bottom: 0.5rem;
}

.privacidade-section a {
  color: var(--color1);
  text-decoration: none;
  font-weight: 500;
}

.privacidade-section a:hover {
  text-decoration: underline;
}

.contact-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--color1);
}

.contact-info p {
  margin: 0.5rem 0;
}

.privacidade-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .privacidade-container {
    padding: 1rem;
    margin: 1rem;
  }
  
  .privacidade-content h1 {
    font-size: 2rem;
  }
  
  .privacidade-section h2 {
    font-size: 1.2rem;
  }
  
  .privacidade-section h3 {
    font-size: 1rem;
  }
}
</style>
