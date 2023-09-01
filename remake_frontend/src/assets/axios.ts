import axios from "axios"

export const { isAxiosError, CancelToken } = axios

export const Axios = axios.create({
  baseURL: "http://localhost:3000",
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