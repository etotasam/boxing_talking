import {
  useInfinityFetchComments,
  useFetchNewCommentsContainer,
} from '../useInfinityFetchComments';
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

const newComments = {
  newComment1: [
    {
      id: 3,
      postUserName: 'name1',
      comment: '新しいコメント1',
      prediction: undefined,
      createdAt: '2024-03-12 04:58:00',
    },
  ],
  newComment2: [
    {
      id: 3,
      postUserName: 'name2',
      comment: '新しいコメント2',
      prediction: undefined,
      createdAt: '2024-03-12 05:58:00',
    },
  ],
};

const mockFetchNewComments = vi
  .fn()
  .mockReturnValueOnce(newComments.newComment1)
  .mockReturnValueOnce(newComments.newComment2);

const maxPage = Object.keys(comments).length;

// interceptor
const baseURL = import.meta.env.VITE_APP_API_URL;
const server = setupServer(
  //? コメント取得リクエスト
  rest.get(`${baseURL}${API_PATH.COMMENT}`, (req, res, context) => {
    const page = req.url.searchParams.get('page');
    if (page === '1') {
      return res(context.status(200), context.json({ data: comments.page1 }));
    }
    if (page === '2') {
      return res(context.status(200), context.json({ data: comments.page2 }));
    }
  }),

  //? コメントのmaxPageと最新のコメントのcreated_atの取得リクエスト
  rest.get(`${baseURL}${API_PATH.COMMENT_STATE}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ maxPage, resentPostTime: '2024-03-12 03:58:00' }));
  }),

  //? 新しいコメント取得リクエスト
  rest.get(`${baseURL}${API_PATH.COMMENT_NEW}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockFetchNewComments() }));
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

  test('refetchした時は2ページ目(次のページ)のコメントを取得して、取得したコメントはmergeされる', async () => {
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

  test('新しいコメントの取得', async () => {
    const matchId = 1;
    const resentPostTime = '';
    const { result } = renderHook(() => useFetchNewCommentsContainer({ matchId, resentPostTime }), {
      wrapper,
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(newComments.newComment1);
    });
  });

  test('新しいコメントはmergeされて返って来る (orderBy desc)', async () => {
    const matchId = 1;
    const resentPostTime = '';
    const { result } = renderHook(() => useFetchNewCommentsContainer({ matchId, resentPostTime }), {
      wrapper,
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual([...newComments.newComment2, ...newComments.newComment1]);
    });
  });
});
