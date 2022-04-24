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

  logout: async ({ userId }: { userId: number }): Promise<any> => {
    const { data } = await axios.post("api/logout", { user_id: userId })
    return data
  },

  getAuthUser: async (): Promise<UserType> => {
    const { data } = await axios.get(`/api/user`)
    return data
  }
}