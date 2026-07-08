import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ROUTE_PATH } from '@/constants/routePath';
import { deviceState, DeviceStateType } from '@/store/deviceState';
import { Header } from '../Header';

vi.mock('../component/HeaderNavigation', () => ({
  HeaderNavigation: ({
    pathname,
    showAdminLinks,
  }: {
    pathname: string;
    showAdminLinks?: boolean;
  }) => (
    <div data-testid="header-navigation">
      {pathname}:{String(showAdminLinks)}
    </div>
  ),
}));

vi.mock('../component/Hamburger', () => ({
  Hamburger: () => <div data-testid="hamburger" />,
}));

vi.mock('../component/HeaderAuthInfo', () => ({
  HeaderAuthInfo: () => <div data-testid="header-auth-info" />,
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
  });

  test('PCではサイトタイトルとナビゲーションを表示する', () => {
    renderHeader('PC');

    expect(screen.getByRole('heading', { name: 'BOXING TALKING' })).toBeInTheDocument();
    expect(screen.getByTestId('header-navigation')).toHaveTextContent(
      `${ROUTE_PATH.PAST_MATCHES}:true`
    );
    expect(screen.queryByTestId('hamburger')).not.toBeInTheDocument();
    expect(screen.getByTestId('header-auth-info')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('h-[80px]');
  });

  test('SPでは通常ナビゲーションとハンバーガーを表示する', () => {
    renderHeader('SP');

    expect(screen.getByRole('heading', { name: 'BOXING TALKING' })).toBeInTheDocument();
    expect(screen.getByTestId('header-navigation')).toHaveTextContent(
      `${ROUTE_PATH.PAST_MATCHES}:false`
    );
    expect(screen.getByTestId('hamburger')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('h-[126px]', 'bg-black/95');
  });
});
