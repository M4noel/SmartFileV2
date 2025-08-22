import './assets/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import router from './components/router';
import { createHead } from '@vueuse/head';
import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';

// Interceptor global para mensagens de erro simples
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response;
    const status = error.response?.status;
    let simpleMessage = 'Não foi possível completar a ação. Tente novamente.';

    if (isNetworkError) {
      simpleMessage = 'Sem conexão. Verifique sua internet e tente novamente.';
    } else if (status >= 500) {
      simpleMessage = 'Erro interno. Tente novamente em instantes.';
    } else if (status === 400 || status === 404 || status === 422) {
      simpleMessage = 'Requisição inválida. Verifique os dados e tente novamente.';
    } else if (status === 401 || status === 403) {
      simpleMessage = 'Permissão negada. Faça login ou tente novamente.';
    }

    // Padroniza mensagem simples no próprio error
    error.message = simpleMessage;

    // Se o componente tentar ler o corpo como Blob de texto, fornecemos um Blob simples
    if (error.response && error.response.data instanceof Blob) {
      error.response.data = new Blob([simpleMessage], { type: 'text/plain' });
    }

    return Promise.reject(error);
  }
);

const app = createApp(App);
const head = createHead();
app.use(head);
app.use(router);
app.mount('#app');
