import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('afrimos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const refreshToken = localStorage.getItem('afrimos_refresh');
    if (
      error.response?.status === 401 &&
      refreshToken &&
      !original._retried &&
      !original.url.includes('/auth/')
    ) {
      original._retried = true;
      try {
        refreshing =
          refreshing ||
          axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken });
        const { data } = await refreshing;
        refreshing = null;
        localStorage.setItem('afrimos_token', data.token);
        localStorage.setItem('afrimos_refresh', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch {
        refreshing = null;
        localStorage.removeItem('afrimos_token');
        localStorage.removeItem('afrimos_refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiError = (err, fallback = 'Something went wrong') =>
  err.response?.data?.error || err.response?.data?.details?.[0]?.message || fallback;

export default api;
