import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ROUTE_PATH } from '@/constants/routePath';
import { deviceState } from '@/store/deviceState';
import { Header } from '../Header';

const mockUseAdmin = vi.fn();

vi.mock('@/hooks/apiHooks/auth', () => ({
  useAdmin: () => mockUseAdmin(),
}));

vi.mock('../component/HeaderAuthInfo', () => ({
  HeaderAuthInfo: () => <div>ユーザー情報</div>,
}));

const DeviceSwitchButtons = () => {
  const setDevice = useSetRecoilState(deviceState);

  return (
    <>
      <button type="button" onClick={() => setDevice('PC')}>
        PCに切替
      </button>
      <button type="button" onClick={() => setDevice('SP')}>
        SPに切替
      </button>
    </>
  );
};

const renderHeader = () =>
  render(
    <RecoilRoot
      initializeState={({ set }) => {
        set(deviceState, 'SP');
      }}
    >
      <MemoryRouter initialEntries={[ROUTE_PATH.HOME]}>
        <Header />
        <DeviceSwitchButtons />
      </MemoryRouter>
    </RecoilRoot>
  );

describe('Headerのデバイス切替', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_APP_SITE_TITLE', 'BOXING TALKING');
    mockUseAdmin.mockReturnValue({ isAdmin: true });
  });

  test('SPで開いた管理パネルはPCを経由してSPへ戻ると閉じたままになる', () => {
    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: '管理メニューを開閉' }));
    expect(screen.getByTestId('sp-admin-menu-popover')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'PCに切替' }));
    expect(screen.queryByTestId('sp-admin-menu-popover')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'SPに切替' }));
    expect(screen.queryByTestId('sp-admin-menu-popover')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '管理メニューを開閉' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
