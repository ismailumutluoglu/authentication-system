import axios from 'axios';

// ─────────────────────────────────────
// 1. AXIOS INSTANCE
// ─────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // cookie'lerin gidip gelmesi için şart
});

// ─────────────────────────────────────
// 2. ACCESS TOKEN — MEMORY'DE TUTUYORUZ
// ─────────────────────────────────────
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// ─────────────────────────────────────
// 3. REQUEST INTERCEPTOR
// ─────────────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─────────────────────────────────────
// 4. RESPONSE INTERCEPTOR
// ─────────────────────────────────────
api.interceptors.response.use(
  // Başarılı cevap — dokunma, direkt geç
  (response) => response,

  // Hata geldi
  async (error) => {
    const originalRequest = error.config;

    // 401 geldi ve daha önce retry denemedik
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token ile yeni access token al
        const res = await api.post('/auth/refresh');
        const newToken = res.data.accessToken;

        // Yeni token'ı kaydet
        setAccessToken(newToken);

        // Başarısız isteği yeni token ile tekrar gönder
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token da geçersiz — kullanıcıyı login'e yönlendir
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;