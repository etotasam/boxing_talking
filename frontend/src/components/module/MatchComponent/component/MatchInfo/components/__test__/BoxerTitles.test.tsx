import '@testing-library/jest-dom/vitest';
import { render, screen, within } from 'test-setup';
import { describe, expect, test } from 'vitest';
import { ORGANIZATIONS, WEIGHT_CLASS } from '@/constants/boxerData';
import type { TitlesStateType } from '@/types';
import { BoxerTitles } from '../BoxerTitles';

const renderTitles = (titles: TitlesStateType[]) => {
  render(<BoxerTitles boxerName="赤ボクサー" side="red" titles={titles} />);
};

describe('BoxerTitles', () => {
  test.each([
    { state: null, label: null },
    { state: 'new', label: 'New' },
    { state: 'still', label: null },
    { state: 'fall', label: null },
  ] as const)('タイトル状態が $state の時は「$label」と表示する', ({ state, label }) => {
    renderTitles([
      {
        organization: ORGANIZATIONS.WBA,
        weight: WEIGHT_CLASS.BANTAM,
        state,
      },
    ]);

    const titles = screen.getByRole('region', { name: '赤ボクサーの保持タイトル' });
    expect(within(titles).getByRole('heading', { name: 'バンタム級' })).toBeInTheDocument();
    expect(within(titles).getByText(ORGANIZATIONS.WBA)).toBeInTheDocument();
    if (label) {
      expect(within(titles).getByText(label)).toBeInTheDocument();
    } else {
      expect(within(titles).queryByText('New')).not.toBeInTheDocument();
    }
    expect(within(titles).queryByText(/獲得|防衛|失冠|保持/)).not.toBeInTheDocument();
  });

  test('タイトルを階級順にまとめ、同じ階級の団体を並べて表示する', () => {
    renderTitles([
      {
        organization: ORGANIZATIONS.WBA,
        weight: WEIGHT_CLASS.BANTAM,
        state: 'still',
      },
      {
        organization: ORGANIZATIONS.WBC,
        weight: WEIGHT_CLASS.BANTAM,
        state: 'new',
      },
      {
        organization: ORGANIZATIONS.IBF,
        weight: WEIGHT_CLASS.S_BANTAM,
        state: null,
      },
    ]);

    const titles = screen.getByRole('region', { name: '赤ボクサーの保持タイトル' });
    const weightHeadings = within(titles).getAllByRole('heading', { level: 3 });
    expect(weightHeadings.map((heading) => heading.textContent)).toEqual([
      'スーパーバンタム級',
      'バンタム級',
    ]);

    const bantamOrganizations = within(titles).getByRole('list', {
      name: 'バンタム級のタイトル団体',
    });
    expect(within(bantamOrganizations).getAllByRole('listitem')).toHaveLength(2);
    expect(within(bantamOrganizations).getByText(ORGANIZATIONS.WBA)).toBeInTheDocument();
    expect(within(bantamOrganizations).getByText(ORGANIZATIONS.WBC)).toBeInTheDocument();
  });

  test('保持タイトルがない時はタイトル一覧を表示しない', () => {
    renderTitles([]);

    expect(
      screen.queryByRole('region', { name: '赤ボクサーの保持タイトル' })
    ).not.toBeInTheDocument();
  });
});
