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
  auth: generateQueryKey('auth'),
  guest: generateQueryKey('guest'),
  admin: generateQueryKey('admin'),
  boxer: generateQueryKey('boxer'),
  countBoxer: generateQueryKey('boxer/count'),
  isBoxerSelected: generateQueryKey('boxer/select'),
  matchesFetch: generateQueryKey('match/fetch'),
  matchDelete: generateQueryKey('match/delete'),
  comment: generateQueryKey('comment'),
  prediction: generateQueryKey('prediction'),
} as const


