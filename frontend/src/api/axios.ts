import axios from "axios"

export const { isAxiosError, CancelToken } = axios

export const Axios = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
})

Axios.interceptors.request.use(async (config) => {
  // CookieからXSRF-TOKENを取得してリクエストヘッダーに追加
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  if (csrfToken) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken); // デコードしてヘッダーに追加
  }
  return config;
});

Axios.interceptors.response.use(
  (response) => {
    return Promise.resolve(response)
  },
  (error) => {
    return Promise.reject(error.response)
  }
)