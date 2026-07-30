import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
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
  HeaderAuthInfo: () => <div data-testid="header-auth-info" />,
}));

vi.mock('../component/AdminMenuPopover', () => ({
  AdminMenuPopover: () => <div data-testid="pc-admin-menu-popover" />,
}));

vi.mock('../component/SpAdminMenuPopover', () => ({
  SpAdminMenuPopover: () => <div data-testid="sp-admin-menu-popover" />,
}));

const renderHeader = (device: DeviceStateType = 'PC') => {
  return render(
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
};

describe('Header', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_APP_SITE_TITLE', 'BOXING TALKING');
    mockUseAdmin.mockReturnValue({ isAdmin: false });
  });

  test('PCではサイトタイトルとナビゲーションを表示する', () => {
    renderHeader('PC');

    expect(screen.getByRole('heading', { name: 'BOXING TALKING' })).toBeInTheDocument();
    expect(screen.getByTestId('header-navigation')).toHaveTextContent(ROUTE_PATH.PAST_MATCHES);
    expect(screen.getByTestId('pc-admin-menu-popover')).toBeInTheDocument();
    expect(screen.queryByTestId('sp-admin-menu-popover')).not.toBeInTheDocument();
    expect(screen.getByTestId('header-auth-info')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('h-[80px]');
  });

  test('SPでは通常ナビゲーションを表示する', () => {
    renderHeader('SP');

    expect(screen.getByRole('heading', { name: 'BOXING TALKING' })).toBeInTheDocument();
    expect(screen.getByTestId('header-navigation')).toHaveTextContent(ROUTE_PATH.PAST_MATCHES);
    expect(screen.queryByTestId('pc-admin-menu-popover')).not.toBeInTheDocument();
    expect(screen.getByTestId('sp-admin-menu-popover')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('h-[126px]', 'bg-black/95');
  });

});
