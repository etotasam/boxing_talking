import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from 'react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ROUTE_PATH } from '@/assets/routePath';
import { deviceState } from '@/store/deviceState';
import { Header } from '../Header';

const mockUseAdmin = vi.fn();
const mockUseGuest = vi.fn();
const mockUseAuth = vi.fn();
const mockLogout = vi.fn();
const mockGuestLogout = vi.fn();

vi.mock('@/hooks/apiHooks/useAuth', () => ({
  useGuest: () => mockUseGuest(),
  useAuth: () => mockUseAuth(),
  useAdmin: () => mockUseAdmin(),
  useLogout: () => ({ logout: mockLogout }),
  useGuestLogout: () => ({ guestLogout: mockGuestLogout }),
}));

vi.mock('../component/Hamburger', () => ({
  Hamburger: () => <div data-testid="hamburger" />,
}));

const renderHeader = (device: 'PC' | 'SP' = 'PC') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RecoilRoot
        initializeState={({ set }) => {
          set(deviceState, device);
        }}
      >
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </RecoilRoot>
    </QueryClientProvider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    mockUseAdmin.mockReturnValue({ isAdmin: false });
    mockUseGuest.mockReturnValue({ data: false });
    mockUseAuth.mockReturnValue({ data: null });
    mockLogout.mockReset();
    mockGuestLogout.mockReset();
  });

  test('管理者なら管理ページリンクを表示する', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true });

    const { container } = renderHeader();

    expect(container.querySelector(`a[href="${ROUTE_PATH.BOXER_REGISTER}"]`)).toBeInTheDocument();
    expect(container.querySelector(`a[href="${ROUTE_PATH.MATCH_REGISTER}"]`)).toBeInTheDocument();
  });

  test('管理者でなければ管理ページリンクを表示しない', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false });

    const { container } = renderHeader();

    expect(container.querySelector(`a[href="${ROUTE_PATH.BOXER_REGISTER}"]`)).not.toBeInTheDocument();
    expect(container.querySelector(`a[href="${ROUTE_PATH.MATCH_REGISTER}"]`)).not.toBeInTheDocument();
  });

  test('認証ユーザー時にユーザー名を表示する', () => {
    mockUseAuth.mockReturnValue({ data: { name: 'Taro' } });

    renderHeader();

    expect(screen.getByText('Taro')).toBeInTheDocument();
  });

  test('ゲスト時にゲスト表示になる', () => {
    mockUseGuest.mockReturnValue({ data: true });

    renderHeader();

    expect(screen.getByText('ゲスト')).toBeInTheDocument();
  });

  test('認証ユーザーのログアウト操作で logout が呼ばれる', () => {
    mockUseAuth.mockReturnValue({ data: { name: 'Taro' } });

    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockGuestLogout).not.toHaveBeenCalled();
  });

  test('ゲストのログアウト操作で guestLogout が呼ばれる', () => {
    mockUseGuest.mockReturnValue({ data: true });

    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(mockGuestLogout).toHaveBeenCalledTimes(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  test('ログアウト操作がアクセシブルネームで認識できる', () => {
    mockUseAuth.mockReturnValue({ data: { name: 'Taro' } });

    renderHeader('SP');

    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument();
  });
});
