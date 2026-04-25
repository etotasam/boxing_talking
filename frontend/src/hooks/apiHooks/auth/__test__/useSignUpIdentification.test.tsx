import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { Axios } from '@/api/axios';
import { CUSTOM_ERROR_CODE } from '@/constants/customErrorCodes';
import { TOKEN_ERROR_MESSAGE } from '@/constants/tokenErrorMessage';
import { useSignUpIdentification } from '@/hooks/apiHooks/auth';
import { authCheckingState } from '@/store/authCheckingState';
import { tokenErrorMessageState } from '@/store/tokenErrorMessageState';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

const mocks = vi.hoisted(() => {
  return {
    post: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      post: mocks.post,
    },
  };
});

// RecoilRoot と QueryClientProvider 付きの hook テスト用 wrapper を生成する関数
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
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </RecoilRoot>
    );
  };
};

// 認証確認画面で使う Recoil 状態をまとめて参照する補助 hook
const useIdentificationStates = () => {
  return {
    authState: useRecoilValue(authCheckingState),
    tokenErrorMessage: useRecoilValue(tokenErrorMessageState),
  };
};

describe('useSignUpIdentification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('createUser成功時にauthCheckingStateがloadingからsuccessへ変化する', async () => {
    vi.mocked(Axios.post).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: true }), 0))
    );

    const { result } = renderHook(
      () => {
        return {
          signUpIdentification: useSignUpIdentification(),
          states: useIdentificationStates(),
        };
      },
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.signUpIdentification.createUser({ token: 'valid-token' });
    });

    await waitFor(() => {
      expect(result.current.states.authState).toEqual({
        isLoading: true,
        isSuccess: false,
        isError: false,
      });
    });

    await waitFor(() => {
      expect(result.current.states.authState).toEqual({
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
      expect(result.current.states.tokenErrorMessage).toBe(TOKEN_ERROR_MESSAGE.NULL);
    });
  });

  test('EXPIRED_TOKEN時は期限切れメッセージを設定してerror状態にする', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      data: {
        errorCode: CUSTOM_ERROR_CODE.EXPIRED_TOKEN,
      },
    });

    const { result } = renderHook(
      () => {
        return {
          signUpIdentification: useSignUpIdentification(),
          states: useIdentificationStates(),
        };
      },
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.signUpIdentification.createUser({ token: 'expired-token' });
    });

    await waitFor(() => {
      expect(result.current.states.authState).toEqual({
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
      expect(result.current.states.tokenErrorMessage).toBe(TOKEN_ERROR_MESSAGE.EXPIRED_TOKEN);
    });
  });

  test('INVALID_TOKEN時は無効メッセージを設定してerror状態にする', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      data: {
        errorCode: CUSTOM_ERROR_CODE.INVALID_TOKEN,
      },
    });

    const { result } = renderHook(
      () => {
        return {
          signUpIdentification: useSignUpIdentification(),
          states: useIdentificationStates(),
        };
      },
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.signUpIdentification.createUser({ token: 'invalid-token' });
    });

    await waitFor(() => {
      expect(result.current.states.authState).toEqual({
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
      expect(result.current.states.tokenErrorMessage).toBe(TOKEN_ERROR_MESSAGE.INVALID_TOKEN);
    });
  });

  test('想定外errorCode時はtokenErrorMessageStateを変えずにerror状態にする', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      data: {
        errorCode: 9999,
      },
    });

    const { result } = renderHook(
      () => {
        return {
          signUpIdentification: useSignUpIdentification(),
          states: useIdentificationStates(),
        };
      },
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.signUpIdentification.createUser({ token: 'unexpected-token' });
    });

    await waitFor(() => {
      expect(result.current.states.authState).toEqual({
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
      expect(result.current.states.tokenErrorMessage).toBe(TOKEN_ERROR_MESSAGE.NULL);
    });
  });
});
