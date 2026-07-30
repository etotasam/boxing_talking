import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ADMIN_PAGE_LINKS } from '@/constants/adminPageLinks';
import { ROUTE_PATH } from '@/constants/routePath';
import { deviceState, DeviceStateType } from '@/store/deviceState';
import { Header } from '../Header';

const mockUseAdmin = vi.fn();

vi.mock('@/hooks/apiHooks/auth', () => ({
  useAdmin: () => mockUseAdmin(),
}));

vi.mock('../component/HeaderNavigation', () => ({
  HeaderNavigation: ({ pathname }: { pathname: string }) => (
    <div data-testid="header-navigation">{pathname}</div>
  ),
}));

vi.mock('../component/HeaderAuthInfo', () => ({
  HeaderAuthInfo: () => <div data-testid="header-auth-info">ユーザー情報 / ログアウト</div>,
}));

vi.mock('../component/SpCommonMenuPopover', () => ({
  SpCommonMenuPopover: () => <button type="button">一般ページを開閉</button>,
}));

const renderHeader = (device: DeviceStateType = 'PC') =>
  render(
    <RecoilRoot
      initializeState={({ set }) => {
        set(deviceState, device);
      }}
    >
      <MemoryRouter initialEntries={[ROUTE_PATH.PAST_MATCHES]}>
        <Header />
      </MemoryRouter>
    </RecoilRoot>
  );

describe('Header', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_APP_SITE_TITLE', 'BOXING TALKING');
    mockUseAdmin.mockReturnValue({ isAdmin: false, isFetching: false, isError: false });
  });

  test('PC admin は通常導線と4件の管理リンクを表示し、旧PCポップオーバーを描画しない', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isFetching: false, isError: false });

    renderHeader('PC');

    expect(screen.getByRole('heading', { name: 'BOXING TALKING' })).toBeInTheDocument();
    expect(screen.getByTestId('header-navigation')).toHaveTextContent(ROUTE_PATH.PAST_MATCHES);
    expect(screen.getByTestId('header-auth-info')).toHaveTextContent('ログアウト');
    expect(screen.queryByRole('button', { name: '管理メニューを開閉' })).not.toBeInTheDocument();
    ADMIN_PAGE_LINKS.forEach((link) => {
      expect(screen.getByRole('link', { name: link.name })).toHaveAttribute('href', link.path);
    });
    expect(screen.getByRole('navigation', { name: '管理ページ' })).toBeInTheDocument();
    expect(screen.queryByTestId('pc-admin-menu-popover')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sp-admin-menu-popover')).not.toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('h-[132px]');
  });

  test('PC non-admin は管理導線を表示せず1段ヘッダーを表示する', () => {
    renderHeader('PC');

    expect(screen.getByTestId('header-navigation')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '管理ページ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '一般ページを開閉' })).not.toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('h-[80px]');
  });

  test('SP admin は管理リンクと一般ページアコーディオンを表示する', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isFetching: false, isError: false });

    renderHeader('SP');

    const adminNavigation = screen.getByRole('navigation', { name: '管理ページ' });
    expect(adminNavigation.querySelectorAll('a')).toHaveLength(4);
    ADMIN_PAGE_LINKS.forEach((link) => {
      expect(screen.getByRole('link', { name: link.name })).toHaveAttribute('href', link.path);
    });
    expect(screen.getByRole('button', { name: '一般ページを開閉' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '管理ページ' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('h-[126px]');
  });

  test('SP non-admin は共通ナビゲーションのみを表示する', () => {
    renderHeader('SP');

    expect(screen.getByTestId('header-navigation')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '管理ページ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '一般ページを開閉' })).not.toBeInTheDocument();
  });

  test.each([
    ['取得中', { isAdmin: true, isFetching: true, isError: false }],
    ['取得エラー', { isAdmin: true, isFetching: false, isError: true }],
    ['管理者ではない', { isAdmin: false, isFetching: false, isError: false }],
  ])('admin判定が%sの間はfail-closedで管理導線を表示しない', (_label, adminState) => {
    mockUseAdmin.mockReturnValue(adminState);

    renderHeader('PC');

    expect(screen.queryByRole('navigation', { name: '管理ページ' })).not.toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('h-[80px]');
  });
});
