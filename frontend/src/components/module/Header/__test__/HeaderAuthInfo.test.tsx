import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { deviceState, DeviceStateType } from '@/store/deviceState';
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

const renderHeaderAuthInfo = (device: DeviceStateType = 'PC') => {
  return render(
    <RecoilRoot
      initializeState={({ set }) => {
        set(deviceState, device);
      }}
    >
      <HeaderAuthInfo />
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

  test('認証ユーザー時にユーザー名を表示して logout を呼ぶ', () => {
    mockUseAuth.mockReturnValue({ data: { name: 'Taro' } });

    renderHeaderAuthInfo();

    expect(screen.getByText('Taro')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockGuestLogout).not.toHaveBeenCalled();
  });

  test('ゲスト時にゲスト表示をして guestLogout を呼ぶ', () => {
    mockUseGuest.mockReturnValue({ data: true });

    renderHeaderAuthInfo();

    expect(screen.getByText('ゲスト')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(mockGuestLogout).toHaveBeenCalledTimes(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  test('認証ユーザーでもゲストでもなければ表示しない', () => {
    renderHeaderAuthInfo();

    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument();
  });

  test('SPでもログアウト操作がアクセシブルネームで認識できる', () => {
    mockUseAuth.mockReturnValue({ data: { name: 'Taro' } });

    renderHeaderAuthInfo('SP');

    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument();
  });
});
