import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Hamburger } from '../component/Hamburger';

const mockToggleMenuModal = vi.fn();
const mockHideMenuModal = vi.fn();

vi.mock('@/hooks/useMenuModal', () => ({
  useMenuModal: () => ({
    state: false,
    toggle: mockToggleMenuModal,
    hide: mockHideMenuModal,
  }),
}));

const renderHamburger = () => {
  return render(
    <RecoilRoot>
      <MemoryRouter>
        <Hamburger />
      </MemoryRouter>
    </RecoilRoot>
  );
};

describe('Hamburger', () => {
  beforeEach(() => {
    mockToggleMenuModal.mockReset();
    mockHideMenuModal.mockReset();
  });

  test('管理メニューを開閉するボタンとして表示する', () => {
    renderHamburger();

    expect(screen.getByRole('button', { name: '管理メニューを開閉' })).toBeInTheDocument();
  });

  test('クリック時にメニュー表示を切り替える', () => {
    renderHamburger();

    fireEvent.click(screen.getByRole('button', { name: '管理メニューを開閉' }));

    expect(mockToggleMenuModal).toHaveBeenCalledTimes(1);
  });
});
