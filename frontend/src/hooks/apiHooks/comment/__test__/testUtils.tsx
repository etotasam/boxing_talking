import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { RecoilRoot } from 'recoil';
import type { CommentType } from '@/types';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

export const comment: CommentType = {
  id: 1,
  postUserName: 'comment user',
  comment: 'test comment',
  prediction: undefined,
  createdAt: '2024-03-12 03:58:00',
};

export const commentsResponse = {
  data: {
    data: [comment],
  },
};

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export const createWrapper = (queryClient = createQueryClient()) => {
  return ({ children }: { children: ReactNode }) => {
    return (
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </RecoilRoot>
    );
  };
};
