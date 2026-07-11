import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ROUTE_PATH } from '@/constants/routePath';
import { HeaderNavigation } from '../component/HeaderNavigation';

const mockUseAdmin = vi.fn();

vi.mock('@/hooks/apiHooks/auth', () => ({
  useAdmin: () => mockUseAdmin(),
}));

const renderHeaderNavigation = (pathname = ROUTE_PATH.HOME) => {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <HeaderNavigation pathname={pathname} />
    </MemoryRouter>
  );
};

describe('HeaderNavigation', () => {
  beforeEach(() => {
    mockUseAdmin.mockReturnValue({ isAdmin: false });
  });

  test('通常リンクを表示する', () => {
    renderHeaderNavigation();

    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveAttribute(
      'href',
      ROUTE_PATH.HOME
    );
    expect(screen.getByRole('link', { name: 'Match Result' })).toHaveAttribute(
      'href',
      ROUTE_PATH.PAST_MATCHES
    );
  });

  test('管理者でも管理ページリンクを常時表示しない', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true });

    const { container } = renderHeaderNavigation();

    expect(container.querySelectorAll('a')).toHaveLength(2);
  });
});
