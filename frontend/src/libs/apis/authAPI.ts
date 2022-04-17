import axios from "@/libs/axios"

export type UserType = {
  id: number,
  name: string,
  email: string
}

type LoginProps = {
  email: string,
  password: string
}

export const authAPI = {

  login: async (props: LoginProps): Promise<UserType> => {
    const { data } = await axios.post("api/login", { ...props })
    return data
  },

  logout: async (): Promise<any> => {
    const { data } = await axios.post("api/logout")
    return data
  },

  getAuthUser: async (): Promise<UserType> => {
    const { data } = await axios.get(`/api/user`)
    return data
  }
}