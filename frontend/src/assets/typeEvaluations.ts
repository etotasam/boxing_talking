import { MESSAGE } from "./statusesOnToastModal";
import { MessageType } from "@/assets/types"

export const isMessageType = (message: unknown): message is MessageType => {
  const modalMessage = Object.values(MESSAGE);
  return modalMessage.includes(message as MessageType);
};