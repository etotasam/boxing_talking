import { atom } from "recoil";

export type DeviceStateType = "PC" | "SP" | undefined
export const deviceState = atom<DeviceStateType>({
  key: "deviceState",
  default: undefined
})