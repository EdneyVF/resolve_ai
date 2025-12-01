import axios from 'axios';

const local_url = 'http://localhost:3001';
const baseURL = import.meta.env.VITE_API_URL || local_url;

console.log('API URL:', baseURL); // Log para depuração

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {

      if (error.response.status === 401 && 
          !error.config.url.includes('login') && 
          !error.config.url.includes('register')) {

        localStorage.removeItem('token');

      }

      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      } else {

        switch (error.response.status) {
          case 403:
            error.message = 'Você não tem permissões suficientes para acessar este recurso.';
            break;
          case 401:
            error.message = 'Sua sessão expirou ou você precisa fazer login novamente.';
            break;
          case 404:
            error.message = 'O recurso solicitado não foi encontrado.';
            break;
          case 500:
            error.message = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            error.message = 'Ocorreu um erro ao processar sua solicitação.';
        }
      }
    } else if (error.request) {

      error.message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    } else {

      error.message = 'Erro ao configurar a requisição.';
    }
    
    return Promise.reject(error);
  }
);

export default api; 