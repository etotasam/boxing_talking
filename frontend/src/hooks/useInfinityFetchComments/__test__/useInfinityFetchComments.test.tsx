import { useInfinityFetchComments } from '../useInfinityFetchComments';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, test, vi, beforeAll, afterAll } from 'vitest';
import { RecoilRoot } from 'recoil';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { API_PATH } from '@/assets/apiPath';

const comments = {
  page1: [
    {
      id: 1,
      postUserName: 'name1',
      comment: 'こめんと1',
      prediction: undefined,
      createdAt: '2024-03-12 03:58:00',
    },
  ],
  page2: [
    {
      id: 2,
      postUserName: 'name2',
      comment: 'こめんと2',
      prediction: undefined,
      createdAt: '2024-03-12 03:57:00',
    },
  ],
};

const maxPage = Object.keys(comments).length;

// interceptor
const baseURL = import.meta.env.VITE_APP_API_URL;
const server = setupServer(
  rest.get(`${baseURL}${API_PATH.COMMENT}`, (req, res, context) => {
    const page = req.url.searchParams.get('page');
    if (page === '1') {
      return res(context.status(200), context.json({ data: comments.page1 }));
    }
    if (page === '2') {
      return res(context.status(200), context.json({ data: comments.page2 }));
    }
  }),

  rest.get(`${baseURL}${API_PATH.COMMENT_STATE}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ maxPage, resentPostTime: '2024-03-12 03:58:00' }));
  })
);

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </RecoilRoot>
);

describe('useInfinityFetchComments', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  test('初期ページ読み込み時にコメントの1ページ目を取得する', async () => {
    const matchId = 1;
    const { result } = renderHook(() => useInfinityFetchComments(matchId), { wrapper });
    expect(result.current.data).not.toBeTruthy();
    await waitFor(() => {
      expect(result.current.data).toEqual(comments.page1);
      expect(result.current.isNextComments).toBeTruthy();
    });
  });

  test('refetchした時は2page目のコメントを取得して、取得したコメントはmergeされる', async () => {
    const matchId = 1;
    const { result } = renderHook(() => useInfinityFetchComments(matchId), { wrapper });

    //? 意図的にrefetchする
    act(() => result.current.refetch());
    //? refetch時には次のページのコメントを取得(page2)してmergeされたコメントが帰ってくる
    await waitFor(() => {
      expect(result.current.data).toEqual([...comments.page1, ...comments.page2]);
      expect(result.current.isNextComments).not.toBeTruthy();
    });
  });

  test('maxPageまでのコメントを取得した場合refetchは実行されない', async () => {
    const matchId = 1;
    const { result } = renderHook(() => useInfinityFetchComments(matchId), { wrapper });

    //? 意図的に再refetchする
    act(() => result.current.refetch());
    //? 返ってくるコメントデータは変わらない
    await waitFor(() => {
      expect(result.current.data).toEqual([...comments.page1, ...comments.page2]);
    });
  });
});
