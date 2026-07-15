import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ADMIN_PAGE_LINKS } from '@/constants/adminPageLinks';
import { SpAdminMenuPopover } from '../component/SpAdminMenuPopover';

const mockUseAdmin = vi.fn();

vi.mock('@/hooks/apiHooks/auth', () => ({
  useAdmin: () => mockUseAdmin(),
}));

const renderPopover = () =>
  render(
    <MemoryRouter initialEntries={[ADMIN_PAGE_LINKS[0].path]}>
      <SpAdminMenuPopover />
      <button type="button">パネル外</button>
      <LocationDisplay />
    </MemoryRouter>
  );

const LocationDisplay = () => {
  const { pathname } = useLocation();

  return <output data-testid="current-pathname">{pathname}</output>;
};

describe('SpAdminMenuPopover', () => {
  beforeEach(() => {
    mockUseAdmin.mockReturnValue({ isAdmin: true });
  });

  test('管理者が開閉でき、全幅パネルに4つの管理ページリンクを表示する', async () => {
    renderPopover();

    const button = screen.getByRole('button', { name: '管理メニューを開閉' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('sp-admin-menu-popover')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('sp-admin-menu-popover').parentElement).toHaveClass(
      'absolute',
      'left-0',
      'w-full'
    );
    ADMIN_PAGE_LINKS.forEach((link) => {
      expect(screen.getByRole('link', { name: link.name })).toHaveAttribute('href', link.path);
    });
    expect(screen.getByRole('link', { name: ADMIN_PAGE_LINKS[0].name })).toHaveAttribute(
      'aria-current',
      'page'
    );

    const panel = screen.getByTestId('sp-admin-menu-popover');
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(panel.parentElement).toHaveAttribute('inert');
    expect(panel.parentElement).toHaveClass('pointer-events-none');
    expect(screen.queryByRole('link', { name: ADMIN_PAGE_LINKS[0].name })).not.toBeInTheDocument();
    await waitForElementToBeRemoved(panel);
  });

  test('Escキーとパネル外タップで閉じる', async () => {
    renderPopover();
    const button = screen.getByRole('button', { name: '管理メニューを開閉' });

    fireEvent.click(button);
    const panelAfterEscape = screen.getByTestId('sp-admin-menu-popover');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await waitForElementToBeRemoved(panelAfterEscape);

    fireEvent.click(button);
    const panelAfterOutsideTap = screen.getByTestId('sp-admin-menu-popover');
    fireEvent.pointerDown(screen.getByRole('button', { name: 'パネル外' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await waitForElementToBeRemoved(panelAfterOutsideTap);
  });

  test('リンククリックで閉じる', async () => {
    renderPopover();

    fireEvent.click(screen.getByRole('button', { name: '管理メニューを開閉' }));
    const panel = screen.getByTestId('sp-admin-menu-popover');
    fireEvent.click(screen.getByRole('link', { name: ADMIN_PAGE_LINKS[1].name }));

    expect(screen.getByTestId('current-pathname')).toHaveTextContent(ADMIN_PAGE_LINKS[1].path);
    await waitForElementToBeRemoved(panel);
  });

  test('非管理者には管理メニューを表示しない', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false });
    renderPopover();

    expect(screen.queryByRole('button', { name: '管理メニューを開閉' })).not.toBeInTheDocument();
  });
});
