import axios from "axios"

export const { isAxiosError, CancelToken } = axios

export const Axios = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
})

Axios.interceptors.response.use(
  (response) => {
    return Promise.resolve(response)
  },
  (error) => {
    return Promise.reject(error.response)
  }
)