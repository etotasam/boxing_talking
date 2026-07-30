import '@testing-library/jest-dom/vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import { COMMON_PAGE_LINKS } from '@/constants/commonPageLinks';
import { SpCommonMenuPopover } from '../component/SpCommonMenuPopover';

const LocationDisplay = () => {
  const { pathname } = useLocation();

  return <output data-testid="current-pathname">{pathname}</output>;
};

const renderPopover = () =>
  render(
    <MemoryRouter initialEntries={[COMMON_PAGE_LINKS[0].path]}>
      <SpCommonMenuPopover />
      <button type="button">パネル外</button>
      <LocationDisplay />
    </MemoryRouter>
  );

describe('SpCommonMenuPopover', () => {
  beforeEach(() => {
    document.body.focus();
  });

  test('開閉状態と共通リンクを公開し、再押下で閉じる', async () => {
    renderPopover();

    const trigger = screen.getByRole('button', { name: '一般ページを開閉' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', 'sp-common-page-links');
    expect(screen.queryByTestId('sp-common-menu-popover')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByTestId('sp-common-menu-popover');
    COMMON_PAGE_LINKS.forEach((link) => {
      expect(screen.getByRole('link', { name: link.name })).toHaveAttribute('href', link.path);
    });
    expect(screen.getByRole('link', { name: COMMON_PAGE_LINKS[0].name })).toHaveAttribute(
      'aria-current',
      'page'
    );

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const menuFrame = panel.parentElement;
    expect(menuFrame).toHaveAttribute('aria-hidden', 'true');
    expect(menuFrame).toHaveAttribute('inert');
    expect(menuFrame).toHaveClass('pointer-events-none');
    await waitForElementToBeRemoved(panel);
  });

  test('Escで閉じ、トリガーへフォーカスを戻す', async () => {
    renderPopover();

    const trigger = screen.getByRole('button', { name: '一般ページを開閉' });
    fireEvent.click(trigger);
    const panel = screen.getByTestId('sp-common-menu-popover');
    const link = screen.getByRole('link', { name: COMMON_PAGE_LINKS[1].name });
    link.focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    await waitForElementToBeRemoved(panel);
  });

  test('パネル外タップで閉じる', async () => {
    renderPopover();

    const trigger = screen.getByRole('button', { name: '一般ページを開閉' });
    fireEvent.click(trigger);
    const panel = screen.getByTestId('sp-common-menu-popover');

    fireEvent.pointerDown(screen.getByRole('button', { name: 'パネル外' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitForElementToBeRemoved(panel);
  });

  test('リンク遷移時にパネルを閉じる', async () => {
    renderPopover();

    fireEvent.click(screen.getByRole('button', { name: '一般ページを開閉' }));
    const panel = screen.getByTestId('sp-common-menu-popover');

    fireEvent.click(screen.getByRole('link', { name: COMMON_PAGE_LINKS[1].name }));

    expect(screen.getByTestId('current-pathname')).toHaveTextContent(COMMON_PAGE_LINKS[1].path);
    await waitForElementToBeRemoved(panel);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '一般ページを開閉' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });
  });
});
