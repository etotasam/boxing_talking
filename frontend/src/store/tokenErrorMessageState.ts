import { atom } from "recoil";
import { TOKEN_ERROR_MESSAGE } from "@/assets/tokenErrorMessage";


type atomType = typeof TOKEN_ERROR_MESSAGE[keyof typeof TOKEN_ERROR_MESSAGE]

export const tokenErrorMessageState = atom<atomType>({
  key: "tokenErrorMessageState",
  default: TOKEN_ERROR_MESSAGE.NULL
})
