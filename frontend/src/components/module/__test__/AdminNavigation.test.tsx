import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ADMIN_PAGE_LINKS } from '@/constants/adminPageLinks';
import { AdminMenuButton, AdminPageLinkList } from '../AdminNavigation';

const mockUseAdmin = vi.fn();

vi.mock('@/hooks/apiHooks/auth', () => ({
  useAdmin: () => mockUseAdmin(),
}));

const renderNavigation = (isOpen = false, onClick = vi.fn(), onNavigate = vi.fn()) => {
  return render(
    <MemoryRouter initialEntries={[ADMIN_PAGE_LINKS[0].path]}>
      <AdminMenuButton controlsId="admin-page-links" isOpen={isOpen} onClick={onClick}>
        管理
      </AdminMenuButton>
      <AdminPageLinkList id="admin-page-links" onNavigate={onNavigate} />
    </MemoryRouter>
  );
};

describe('AdminNavigation', () => {
  beforeEach(() => {
    mockUseAdmin.mockReturnValue({ isAdmin: true });
  });

  test('管理者には開閉ボタンと4つの管理ページリンクを表示する', () => {
    renderNavigation(true);

    expect(screen.getByRole('button', { name: '管理メニューを開閉' })).toHaveAttribute(
      'aria-controls',
      'admin-page-links'
    );
    expect(screen.getByRole('button', { name: '管理メニューを開閉' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    ADMIN_PAGE_LINKS.forEach((link) => {
      expect(screen.getByRole('link', { name: link.name })).toHaveAttribute('href', link.path);
    });
    expect(screen.getByRole('link', { name: ADMIN_PAGE_LINKS[0].name })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('非管理者には開閉ボタンと管理ページリンクを表示しない', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false });

    renderNavigation();

    expect(screen.queryByRole('button', { name: '管理メニューを開閉' })).not.toBeInTheDocument();
    ADMIN_PAGE_LINKS.forEach((link) => {
      expect(screen.queryByRole('link', { name: link.name })).not.toBeInTheDocument();
    });
  });

  test('ボタン操作とリンク遷移を呼び出し元へ通知する', () => {
    const onClick = vi.fn();
    const onNavigate = vi.fn();
    renderNavigation(false, onClick, onNavigate);

    fireEvent.click(screen.getByRole('button', { name: '管理メニューを開閉' }));
    fireEvent.click(screen.getByRole('link', { name: ADMIN_PAGE_LINKS[1].name }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
