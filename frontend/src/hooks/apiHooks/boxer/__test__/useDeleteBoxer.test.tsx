import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { STANCE } from '@/constants/boxerData';
import { COUNTRY } from '@/constants/country';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useDeleteBoxer } from '@/hooks/apiHooks/boxer';
import type { BoxerType } from '@/types';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

const mocks = vi.hoisted(() => {
  return {
    get: vi.fn(),
    delete: vi.fn(),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
    showFullScreenLoading: vi.fn(),
    hideFullScreenLoading: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      get: mocks.get,
      delete: mocks.delete,
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

const fetchBoxersResponse = {
  data: {
    data: {
      boxers: [boxer],
      count: 1,
    },
  },
};

// QueryClientProvider と Router 付きの hook テスト用 wrapper を生成する関数
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/boxers']}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
};

// useDeleteBoxer を共通条件で renderHook する関数
const renderUseDeleteBoxer = () => {
  return renderHook(() => useDeleteBoxer(), { wrapper: createWrapper() });
};

describe('useDeleteBoxer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Axios.get).mockResolvedValue(fetchBoxersResponse);
  });

  test('削除成功時に選手データを再取得し、成功トーストを表示する', async () => {
    vi.mocked(Axios.delete).mockResolvedValueOnce({ data: undefined });

    const { result } = renderUseDeleteBoxer();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
    });
    mocks.get.mockClear();

    act(() => {
      result.current.deleteBoxer(boxer);
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.delete).toHaveBeenCalledTimes(1);
      expect(mocks.delete).toHaveBeenCalledWith(API_PATH.BOXER, {
        data: {
          boxerId: boxer.id,
          engName: boxer.engName,
        },
      });
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(MESSAGE.BOXER_DELETED);
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('試合設定済みエラー時は削除不可のエラートーストを表示する', async () => {
    vi.mocked(Axios.delete).mockRejectedValueOnce({
      data: {
        errorCode: CUSTOM_ERROR_CODE.BOXER_ALREADY_HAS_MATCH,
      },
    });

    const { result } = renderUseDeleteBoxer();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
    });
    mocks.get.mockClear();

    act(() => {
      result.current.deleteBoxer(boxer);
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.BOXER_IS_ALREADY_SETUP_MATCH);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.get).not.toHaveBeenCalled();
    });
  });

  test('選手が存在しないエラー時は不正データのエラートーストを表示する', async () => {
    vi.mocked(Axios.delete).mockRejectedValueOnce({
      data: {
        errorCode: CUSTOM_ERROR_CODE.BOXER_NOT_FOUND,
      },
    });

    const { result } = renderUseDeleteBoxer();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
    });
    mocks.get.mockClear();

    act(() => {
      result.current.deleteBoxer(boxer);
    });

    await waitFor(() => {
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.ILLEGAL_DATA);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.get).not.toHaveBeenCalled();
    });
  });

  test('削除失敗エラー時は削除失敗のエラートーストを表示する', async () => {
    vi.mocked(Axios.delete).mockRejectedValueOnce({
      data: {
        errorCode: CUSTOM_ERROR_CODE.BOXER_DELETE_FAILED,
      },
    });

    const { result } = renderUseDeleteBoxer();

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
    });
    mocks.get.mockClear();

    act(() => {
      result.current.deleteBoxer(boxer);
    });

    await waitFor(() => {
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.FAILED_DELETE_BOXER);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.get).not.toHaveBeenCalled();
    });
  });
});
