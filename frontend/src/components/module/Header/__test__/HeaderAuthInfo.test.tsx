import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { isPcState } from '@/store/isPcState';
import { HeaderAuthInfo } from '../component/HeaderAuthInfo';

const mockUseGuest = vi.fn();
const mockUseAuth = vi.fn();
const mockLogout = vi.fn();
const mockGuestLogout = vi.fn();

vi.mock('@/hooks/apiHooks/auth', () => ({
  useGuest: () => mockUseGuest(),
  useAuth: () => mockUseAuth(),
  useLogout: () => ({ logout: mockLogout }),
  useGuestLogout: () => ({ guestLogout: mockGuestLogout }),
}));

const renderHeaderAuthInfo = (isPc: boolean = true) => {
  return render(
    <RecoilRoot
      initializeState={({ set }) => {
        set(isPcState, isPc);
      }}
    >
      <MemoryRouter>
        <HeaderAuthInfo />
        <button type="button">外側の操作</button>
      </MemoryRouter>
    </RecoilRoot>
  );
};

describe('HeaderAuthInfo', () => {
  beforeEach(() => {
    mockUseGuest.mockReturnValue({ data: false });
    mockUseAuth.mockReturnValue({ data: null });
    mockLogout.mockReset();
    mockGuestLogout.mockReset();
  });

  test.each([true, false])('isPc=%sで開閉し、ログアウト選択時だけ処理を呼ぶ', async (isPc) => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ data: { name: 'Taro' } });
    renderHeaderAuthInfo(isPc);
    const trigger = screen.getByRole('button', { name: 'Taroのユーザーメニュー' });

    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(screen.getAllByRole('button', { name: 'ログアウト' })).toHaveLength(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockGuestLogout).not.toHaveBeenCalled();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'ログアウト' }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockGuestLogout).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument();
  });

  test.each([true, false])('isPc=%sのゲストはゲスト用のログアウトだけを呼ぶ', async (isPc) => {
    const user = userEvent.setup();
    mockUseGuest.mockReturnValue({ data: true });
    renderHeaderAuthInfo(isPc);

    await user.click(screen.getByRole('button', { name: 'ゲストのユーザーメニュー' }));
    expect(mockGuestLogout).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'ログアウト' }));
    expect(mockGuestLogout).toHaveBeenCalledTimes(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  test('認証ユーザーでもゲストでもなければ表示しない', () => {
    renderHeaderAuthInfo();

    expect(screen.queryByRole('button', { name: 'ユーザーメニュー' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument();
  });

  test('外側クリックで閉じ、クリック先のフォーカスを維持する', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ data: { name: 'Taro' } });
    renderHeaderAuthInfo();
    await user.click(screen.getByRole('button', { name: 'Taroのユーザーメニュー' }));
    const outside = screen.getByRole('button', { name: '外側の操作' });
    await user.click(outside);
    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument();
    expect(outside).toHaveFocus();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  test('Escとキーボードでのログアウト後はトリガーにフォーカスを戻す', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ data: { name: 'Taro' } });
    renderHeaderAuthInfo();
    const trigger = screen.getByRole('button', { name: 'Taroのユーザーメニュー' });
    await user.tab();
    await user.keyboard('{Enter}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'ログアウト' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument();

    await user.keyboard(' ');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument();
  });
});
