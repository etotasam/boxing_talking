import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useUpdateBoxerData } from '@/hooks/apiHooks/boxer';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

const mocks = vi.hoisted(() => {
  return {
    patch: vi.fn(),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
    showFullScreenLoading: vi.fn(),
    hideFullScreenLoading: vi.fn(),
    refetchReactQueryArrayKeys: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      patch: mocks.patch,
    },
  };
});

vi.mock('@/hooks/useToastModal', () => {
  return {
    useToastModal: vi.fn(() => {
      return {
        showErrorToast: mocks.showErrorToast,
        showSuccessToast: mocks.showSuccessToast,
      };
    }),
  };
});

vi.mock('@/hooks/useFullScreenLoading', () => {
  return {
    useFullScreenLoading: vi.fn(() => {
      return {
        showFullScreenLoading: mocks.showFullScreenLoading,
        hideFullScreenLoading: mocks.hideFullScreenLoading,
      };
    }),
  };
});

vi.mock('@/hooks/useReactQuery', () => {
  return {
    useReactQuery: vi.fn(() => {
      return {
        refetchReactQueryArrayKeys: mocks.refetchReactQueryArrayKeys,
      };
    }),
  };
});

const input = {
  id: 1,
  name: 'updated boxer',
};

// QueryClientProvider 付きの hook テスト用 wrapper を生成する関数
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

// useUpdateBoxerData を共通条件で renderHook する関数
const renderUseUpdateBoxerData = () => {
  return renderHook(() => useUpdateBoxerData(), { wrapper: createWrapper() });
};

describe('useUpdateBoxerData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('更新成功時に関連キャッシュを再取得し、成功トーストを表示する', async () => {
    vi.mocked(Axios.patch).mockResolvedValueOnce({ data: undefined });

    const { result } = renderUseUpdateBoxerData();

    act(() => {
      result.current.updateBoxer(input);
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.patch).toHaveBeenCalledTimes(1);
      expect(mocks.patch).toHaveBeenCalledWith(API_PATH.BOXER, input);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.refetchReactQueryArrayKeys).toHaveBeenCalledTimes(1);
      expect(mocks.refetchReactQueryArrayKeys).toHaveBeenCalledWith([
        QUERY_KEY.FETCH_MATCHES,
        QUERY_KEY.BOXER,
      ]);
      expect(mocks.showSuccessToast).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(MESSAGE.FIGHTER_EDIT_SUCCESS);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('タイトル重複エラー時はローディングを閉じて編集失敗トーストを表示する', async () => {
    vi.mocked(Axios.patch).mockRejectedValueOnce({
      data: {
        errorCode: CUSTOM_ERROR_CODE.TITLE_ALREADY_HAS_OTHER_BOXER,
      },
    });

    const { result } = renderUseUpdateBoxerData();

    act(() => {
      result.current.updateBoxer(input);
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.FIGHTER_EDIT_FAILED);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.refetchReactQueryArrayKeys).not.toHaveBeenCalled();
    });
  });
});
