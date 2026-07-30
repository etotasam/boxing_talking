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
    mockUseAdmin.mockReturnValue({ isAdmin: true, isFetching: false, isError: false });
  });

  test('SPで開いた一般ページアコーディオンはPCを経由してSPへ戻ると閉じたままになる', () => {
    renderHeader();

    const trigger = screen.getByRole('button', { name: '一般ページを開閉' });
    fireEvent.click(trigger);
    expect(screen.getByTestId('sp-common-menu-popover')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'PCに切替' }));
    expect(screen.queryByTestId('sp-common-menu-popover')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'SPに切替' }));
    expect(screen.queryByTestId('sp-common-menu-popover')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '一般ページを開閉' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
