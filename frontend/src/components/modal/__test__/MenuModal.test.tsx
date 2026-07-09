import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ADMIN_PAGE_LINKS } from '@/constants/adminPageLinks';
import { deviceState, DeviceStateType } from '@/store/deviceState';
import { elementSizeState } from '@/store/elementSizeState';
import { MenuModal } from '../MenuModal';

const mockHideMenuModal = vi.fn();
const mockUseAdmin = vi.fn();
let isShowMenuModal = true;

vi.mock('@/hooks/useMenuModal', () => ({
  useMenuModal: () => ({
    state: isShowMenuModal,
    hide: mockHideMenuModal,
    show: vi.fn(),
    toggle: vi.fn(),
  }),
}));

vi.mock('@/hooks/apiHooks/auth', () => ({
  useAdmin: () => mockUseAdmin(),
}));

vi.mock('framer-motion', async () => {
  const { createElement, Fragment } = await import('react');

  return {
    AnimatePresence: ({ children }: { children: ReactNode }) =>
      createElement(Fragment, null, children),
    motion: {
      div: ({ children, ...props }: ComponentProps<'div'>) =>
        createElement('div', props, children),
    },
  };
});

const renderMenuModal = (props?: { device?: DeviceStateType }) => {
  const device = props?.device ?? 'SP';

  return render(
    <RecoilRoot
      initializeState={({ set }) => {
        set(deviceState, device);
        set(elementSizeState('HEADER_HEIGHT'), 126);
      }}
    >
      <MemoryRouter>
        <MenuModal />
      </MemoryRouter>
    </RecoilRoot>
  );
};

describe('MenuModal', () => {
  beforeEach(() => {
    mockHideMenuModal.mockReset();
    mockUseAdmin.mockReturnValue({ isAdmin: false });
    isShowMenuModal = true;
  });

  test('管理者なら管理ページリンクを表示する', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true });

    renderMenuModal();

    ADMIN_PAGE_LINKS.forEach((link) => {
      expect(screen.getByRole('link', { name: link.name })).toHaveAttribute('href', link.path);
    });
  });

  test('非管理者なら管理ページリンクを表示しない', () => {
    renderMenuModal();

    ADMIN_PAGE_LINKS.forEach((link) => {
      expect(screen.queryByRole('link', { name: link.name })).not.toBeInTheDocument();
    });
  });

  test('管理者ページリンク押下時にメニューを閉じる', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true });

    renderMenuModal();

    fireEvent.click(screen.getByRole('link', { name: ADMIN_PAGE_LINKS[0].name }));

    expect(mockHideMenuModal).toHaveBeenCalledTimes(1);
  });

  test('PCではメニューを閉じる', () => {
    renderMenuModal({ device: 'PC' });

    expect(mockHideMenuModal).toHaveBeenCalledTimes(1);
  });
});
