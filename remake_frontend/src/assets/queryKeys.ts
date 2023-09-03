import { v4 as uuid } from 'uuid';

const mode = import.meta.env.VITE_APP_NODE_ENV

// ! 本番環境ではQueryKeyはuuidを使用
const generateQueryKey = (key: string) => {
  if (mode === "development") {
    return key
  } else {
    return uuid()
  }
}

export const QUERY_KEY = {
  auth: generateQueryKey('auto'),
  admin: generateQueryKey('admin')
} as const


