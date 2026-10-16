import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { COUNTRY } from '@/constants/country';
import { STANCE } from '@/constants/boxerData';
import { useFetchBoxers } from '@/hooks/apiHooks/boxer';
import type { BoxerType } from '@/types';

const mocks = vi.hoisted(() => {
  return {
    get: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      get: mocks.get,
    },
  };
});

const boxer: BoxerType = {
  id: 1,
  name: '井上尚弥',
  engName: 'Naoya Inoue',
  birth: '1993-04-10',
  height: 165,
  reach: 171,
  style: STANCE.ORTHODOX,
  country: COUNTRY.JAPAN,
  win: 26,
  ko: 23,
  draw: 0,
  lose: 0,
  titles: [],
};

// QueryClientProvider と Router 付きの hook テスト用 wrapper を生成する関数
const createWrapper = (initialEntry: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
};

// useFetchBoxers を指定 URL で renderHook する関数
const renderUseFetchBoxers = (initialEntry: string) => {
  return renderHook(() => useFetchBoxers(), { wrapper: createWrapper(initialEntry) });
};

describe('useFetchBoxers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('URL query を API params に反映し、取得した選手一覧と pageCount を返す', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: {
        data: {
          boxers: [boxer],
          count: 16,
        },
      },
    });

    const { result } = renderUseFetchBoxers('/admin/boxers?page=2&name=井上&country=Japan');

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.BOXER, {
        params: {
          page: 2,
          limit: 15,
          name: '井上',
          country: COUNTRY.JAPAN,
        },
      });
      expect(result.current.boxersData).toEqual([boxer]);
      expect(result.current.boxersCount).toBe(16);
      expect(result.current.pageCount).toBe(2);
      expect(result.current.isError).toBe(false);
    });
  });

  test('page query がない時は 1 ページ目として取得する', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce({
      data: {
        data: {
          boxers: [],
          count: 0,
        },
      },
    });

    const { result } = renderUseFetchBoxers('/admin/boxers');

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.BOXER, {
        params: {
          page: 1,
          limit: 15,
          name: null,
          country: null,
        },
      });
      expect(result.current.boxersData).toEqual([]);
      expect(result.current.boxersCount).toBe(0);
      expect(result.current.pageCount).toBe(0);
    });
  });

  test('ページ切り替え中は以前の一覧を保持し、取得完了後に新しい一覧へ切り替える', async () => {
    type Response = { data: { data: { boxers: BoxerType[]; count: number } } };
    let finishRequest!: (value: Response) => void;
    mocks.get
      .mockResolvedValueOnce({ data: { data: { boxers: [boxer], count: 16 } } })
      .mockReturnValueOnce(
        new Promise<Response>((resolve) => {
          finishRequest = resolve;
        })
      );
    const { result } = renderHook(
      () => ({
        boxers: useFetchBoxers(),
        navigate: useNavigate(),
      }),
      { wrapper: createWrapper('/admin/boxers?page=1') }
    );
    await waitFor(() => expect(result.current.boxers.boxersData).toEqual([boxer]));

    act(() => result.current.navigate('/admin/boxers?page=2'));
    await waitFor(() => expect(result.current.boxers.isPreviousData).toBe(true));
    expect(result.current.boxers.boxersData).toEqual([boxer]);
    expect(result.current.boxers.isLoading).toBe(false);

    await act(async () => {
      finishRequest({ data: { data: { boxers: [], count: 16 } } });
    });
    await waitFor(() => {
      expect(result.current.boxers.boxersData).toEqual([]);
      expect(result.current.boxers.isPreviousData).toBe(false);
    });
  });
});
