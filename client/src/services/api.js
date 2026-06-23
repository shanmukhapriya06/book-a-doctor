import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://YOUR-RENDER-URL.onrender.com/api',
  maxBodyLength: 10 * 1024 * 1024,
  maxContentLength: 10 * 1024 * 1024,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;