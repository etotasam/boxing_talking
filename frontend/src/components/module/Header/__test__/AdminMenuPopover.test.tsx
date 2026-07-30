import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ADMIN_PAGE_LINKS } from '@/constants/adminPageLinks';
import { AdminMenuPopover } from '../component/AdminMenuPopover';

const mockUseAdmin = vi.fn();

vi.mock('@/hooks/apiHooks/auth', () => ({
  useAdmin: () => mockUseAdmin(),
}));

const renderPopover = () =>
  render(
    <MemoryRouter initialEntries={[ADMIN_PAGE_LINKS[0].path]}>
      <AdminMenuPopover />
      <button type="button">パネル外</button>
      <LocationDisplay />
    </MemoryRouter>
  );

const LocationDisplay = () => {
  const { pathname } = useLocation();

  return <output data-testid="current-pathname">{pathname}</output>;
};

describe('AdminMenuPopover', () => {
  beforeEach(() => {
    mockUseAdmin.mockReturnValue({ isAdmin: true });
  });

  test('管理者が開閉でき、開いたパネルに4つの管理ページリンクを表示する', () => {
    renderPopover();

    const button = screen.getByRole('button', { name: '管理メニューを開閉' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('pc-admin-menu-popover')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('pc-admin-menu-popover')).toBeInTheDocument();
    ADMIN_PAGE_LINKS.forEach((link) => {
      expect(screen.getByRole('link', { name: link.name })).toHaveAttribute('href', link.path);
    });
    expect(screen.getByRole('link', { name: ADMIN_PAGE_LINKS[0].name })).toHaveAttribute(
      'aria-current',
      'page'
    );

    fireEvent.click(button);
    expect(screen.queryByTestId('pc-admin-menu-popover')).not.toBeInTheDocument();
  });

  test('Escキーとパネル外クリックで閉じる', () => {
    renderPopover();
    const button = screen.getByRole('button', { name: '管理メニューを開閉' });

    fireEvent.click(button);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('pc-admin-menu-popover')).not.toBeInTheDocument();

    fireEvent.click(button);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'パネル外' }));
    expect(screen.queryByTestId('pc-admin-menu-popover')).not.toBeInTheDocument();
  });

  test('リンククリックで閉じる', () => {
    renderPopover();

    fireEvent.click(screen.getByRole('button', { name: '管理メニューを開閉' }));
    fireEvent.click(screen.getByRole('link', { name: ADMIN_PAGE_LINKS[1].name }));

    expect(screen.queryByTestId('pc-admin-menu-popover')).not.toBeInTheDocument();
    expect(screen.getByTestId('current-pathname')).toHaveTextContent(ADMIN_PAGE_LINKS[1].path);
  });

  test('非管理者には管理メニューを表示しない', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false });
    renderPopover();

    expect(screen.queryByRole('button', { name: '管理メニューを開閉' })).not.toBeInTheDocument();
  });
});
