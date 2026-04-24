import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Axios } from '@/api/axios';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { HTTP_STATUS_CODE } from '@/constants/httpStatusCodes';
import { usePreSignUp } from '@/hooks/apiHooks/useAuth';

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
    showFullScreenLoading: vi.fn(),
    hideFullScreenLoading: vi.fn(),
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

type PreSignUpInput = {
  name: string;
  email: string;
  password: string;
};

type PreSignUpError = {
  status: number;
  data: {
    message: {
      email?: string[];
      name?: string[];
      password?: string[];
    };
  };
};

const input: PreSignUpInput = {
  name: 'test user',
  email: 'test@example.com',
  password: 'Password1',
};

// QueryClientProvider 付きの hook テスト用 wrapper を生成する関数
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
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

// usePreSignUp を共通条件で renderHook する関数
const renderUsePreSignUp = () => {
  return renderHook(() => usePreSignUp(), { wrapper: createWrapper() });
};

// 共通の入力値で preSignUp を実行する関数
const executePreSignUp = (preSignUp: (props: PreSignUpInput) => void) => {
  act(() => {
    preSignUp(input);
  });
};

// 422 エラー用のモックレスポンスを生成する関数
const createUnprocessableEntityError = (message: PreSignUpError['data']['message']) => {
  return {
    status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
    data: {
      message,
    },
  };
};

// エラートースト表示と loading 終了をまとめて検証する関数
const expectLoadingClosedWithErrorToast = async (message: string) => {
  await waitFor(() => {
    expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
    expect(mocks.showErrorToast).toHaveBeenCalledTimes(1);
    expect(mocks.showErrorToast).toHaveBeenCalledWith(message);
  });
};

describe('usePreSignUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('preSignUp実行時にフルスクリーンローディングを表示し、API成功時に閉じる', async () => {
    vi.mocked(Axios.post).mockResolvedValueOnce({ data: {} });

    const { result } = renderUsePreSignUp();

    executePreSignUp(result.current.preSignUp);

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.showErrorToast).not.toHaveBeenCalled();
    });
  });

  test('emailが既に登録されている場合はemail重複のエラートーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(
      createUnprocessableEntityError({
        email: ['email is already exists'],
      })
    );

    const { result } = renderUsePreSignUp();

    executePreSignUp(result.current.preSignUp);

    await expectLoadingClosedWithErrorToast(MESSAGE.EMAIL_HAS_ALREADY_EXIST);
  });

  test('nameが既に使われている場合はname重複のエラートーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(
      createUnprocessableEntityError({
        name: ['name is already used'],
      })
    );

    const { result } = renderUsePreSignUp();

    executePreSignUp(result.current.preSignUp);

    await expectLoadingClosedWithErrorToast(MESSAGE.USER_NAME_ALREADY_USE);
  });

  test('nameが30文字を超える場合は文字数超過のエラートーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(
      createUnprocessableEntityError({
        name: ['The name must not be greater than 30 characters.'],
      })
    );

    const { result } = renderUsePreSignUp();

    executePreSignUp(result.current.preSignUp);

    await expectLoadingClosedWithErrorToast(MESSAGE.NAME_CHAR_LIMIT_OVER);
  });

  test('422エラーで既知のmessageがない場合は入力不足のエラートーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(
      createUnprocessableEntityError({
        password: ['The password field is required.'],
      })
    );

    const { result } = renderUsePreSignUp();

    executePreSignUp(result.current.preSignUp);

    await expectLoadingClosedWithErrorToast(MESSAGE.SIGNUP_LACK_INPUT);
  });

  test('422以外のエラーでは登録失敗のエラートーストを表示する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce({
      status: 500,
      data: {
        message: 'Internal Server Error',
      },
    });

    const { result } = renderUsePreSignUp();

    executePreSignUp(result.current.preSignUp);

    await expectLoadingClosedWithErrorToast(MESSAGE.USER_REGISTER_FAILED);
  });

  test('emailとnameの両方にエラーがある場合はemailのエラートーストを優先する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(
      createUnprocessableEntityError({
        email: ['email is already exists'],
        name: ['name is already used'],
      })
    );

    const { result } = renderUsePreSignUp();

    executePreSignUp(result.current.preSignUp);

    await expectLoadingClosedWithErrorToast(MESSAGE.EMAIL_HAS_ALREADY_EXIST);
  });

  test('nameに複数エラーがある場合はname重複のエラートーストを優先する', async () => {
    vi.mocked(Axios.post).mockRejectedValueOnce(
      createUnprocessableEntityError({
        name: ['name is already used', 'The name must not be greater than 30 characters.'],
      })
    );

    const { result } = renderUsePreSignUp();

    executePreSignUp(result.current.preSignUp);

    await expectLoadingClosedWithErrorToast(MESSAGE.USER_NAME_ALREADY_USE);
  });
});
