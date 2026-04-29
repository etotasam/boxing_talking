import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useDeleteMatch } from '@/hooks/apiHooks/match';
import { createWrapper, match, matchesResponse } from './testUtils';

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

describe('useDeleteMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Axios.get).mockResolvedValue(matchesResponse);
  });

  test('削除成功時に試合データを再取得し、成功トーストを表示する', async () => {
    vi.mocked(Axios.delete).mockResolvedValueOnce({ data: undefined });

    const { result } = renderHook(() => useDeleteMatch(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(2);
    });
    mocks.get.mockClear();

    act(() => {
      result.current.deleteMatch(match.id);
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.delete).toHaveBeenCalledTimes(1);
      expect(mocks.delete).toHaveBeenCalledWith(API_PATH.MATCH, { data: { matchId: match.id } });
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledTimes(1);
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(MESSAGE.MATCH_DELETED);
      expect(mocks.get).toHaveBeenCalledTimes(2);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('削除失敗時は失敗トーストを表示し、試合データを再取得しない', async () => {
    vi.mocked(Axios.delete).mockRejectedValueOnce(new Error('failed'));

    const { result } = renderHook(() => useDeleteMatch(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(2);
    });
    mocks.get.mockClear();

    act(() => {
      result.current.deleteMatch(match.id);
    });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).toHaveBeenCalledWith(MESSAGE.MATCH_DELETE_FAILED);
      expect(mocks.showSuccessToast).not.toHaveBeenCalled();
      expect(mocks.get).not.toHaveBeenCalled();
    });
  });
});
