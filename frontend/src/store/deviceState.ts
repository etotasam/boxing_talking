import { atom } from "recoil";

type DeviceStateType = "PC" | "SP"
export const deviceState = atom<DeviceStateType>({
  key: "deviceState",
  default: undefined
})