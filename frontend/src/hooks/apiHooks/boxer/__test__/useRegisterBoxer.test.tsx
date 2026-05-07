import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { STANCE } from '@/constants/boxerData';
import { COUNTRY } from '@/constants/country';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { HTTP_STATUS_CODE } from '@/constants/httpStatusCodes';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useRegisterBoxer } from '@/hooks/apiHooks/boxer';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

const mocks = vi.hoisted(() => {
  return {
    post: vi.fn(),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
    showFullScreenLoading: vi.fn(),
    hideFullScreenLoading: vi.fn(),
    refetchReactQueryData: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      post: mocks.post,
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
        refetchReactQueryData: mocks.refetchReactQueryData,
      };
    }),
  };
});

const input = {
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

// useRegisterBoxer を共通条件で renderHook する関数
const renderUseRegisterBoxer = () => {
  return renderHook(() => useRegisterBoxer(), { wrapper: createWrapper() });
};

describe('useRegisterBoxer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('登録成功時に選手キャッシュを再取得し、成功トーストを表示する', async () => {
    vi.mocked(Axios.post).mockResolvedValueOnce({ data: undefined });

    const { result } = renderUseRegisterBoxer();

    act(() => {
      result.current.registerBoxer(input);
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      expect(mocks.post).toHaveBeenCalledWith(API_PATH.BOXER, input);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(MESSAGE.FIGHTER_REGISTER_SUCCESS);
      expect(mocks.refetchReactQueryData).toHaveBeenCalledTimes(1);
      expect(mocks.refetchReactQueryData).toHaveBeenCalledWith(QUERY_KEY.BOXER);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('同名選手の登録エラー時は重複エラートーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      data: {
        errorCode: CUSTOM_ERROR_CODE.BOXER_ALREADY_EXISTS,
      },
    });

    const { result } = renderUseRegisterBoxer();

    act(() => {
      result.current.registerBoxer(input);
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.BOXER_IS_ALREADY_EXISTS);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.refetchReactQueryData).not.toHaveBeenCalled();
    });
  });
});
