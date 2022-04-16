import axios from "axios"

export const { isAxiosError, CancelToken } = axios

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
})