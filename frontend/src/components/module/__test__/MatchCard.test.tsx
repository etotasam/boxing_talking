import '@testing-library/jest-dom/vitest';
import { render, screen } from 'test-setup';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { COUNTRY } from '@/constants/country';
import { GRADE, ORGANIZATIONS, WEIGHT_CLASS, STANCE } from '@/constants/boxerData';
import { MatchDataType } from '@/types';
import { MatchCard } from '@/components/module/MatchCard';

const mockUseVoteIconState = vi.fn();

vi.mock('@/hooks/useVoteIconState', () => ({
  useVoteIconState: (props: unknown) => mockUseVoteIconState(props),
}));

vi.mock('@/components/module/MatchComponent/component/VoteIcon', () => ({
  VoteIconForTop: () => <span data-testid="vote-icon" aria-label="勝敗予想アイコン" />,
}));

const makeBoxer = (overrides: Partial<MatchDataType['redBoxer']> = {}) => ({
  id: 1,
  name: 'ホスベル・ペレス',
  engName: 'Hosber Perez',
  birth: '1990-01-01',
  height: 165,
  reach: 165,
  style: STANCE.ORTHODOX,
  country: COUNTRY.USA,
  win: 10,
  ko: 5,
  draw: 0,
  lose: 0,
  titles: [],
  ...overrides,
});

const makeMatch = (overrides: Partial<MatchDataType> = {}): MatchDataType => ({
  id: 42,
  redBoxer: makeBoxer(),
  blueBoxer: makeBoxer({
    id: 2,
    name: 'サニー・エドワーズ',
    engName: 'Sunny Edwards',
    country: COUNTRY.UK,
  }),
  country: COUNTRY.USA,
  venue: 'T-Mobile Arena',
  grade: GRADE.R12,
  titles: [
    { organization: ORGANIZATIONS.WBA, weightDivision: WEIGHT_CLASS.BANTAM },
    { organization: ORGANIZATIONS.WBC, weightDivision: WEIGHT_CLASS.BANTAM },
    { organization: ORGANIZATIONS.IBF, weightDivision: WEIGHT_CLASS.BANTAM },
  ],
  weight: WEIGHT_CLASS.BANTAM,
  matchDate: '2026-08-30T00:00:00.000Z',
  result: null,
  ...overrides,
});

describe('MatchCard', () => {
  beforeEach(() => {
    mockUseVoteIconState.mockReset();
    mockUseVoteIconState.mockReturnValue(false);
  });

  test('必要な試合情報を表示し、カードでは不要な詳細を表示しない', () => {
    const { container } = render(<MatchCard matchData={makeMatch()} onClick={vi.fn()} />);

    expect(screen.getByText('ホスベル・ペレス')).toBeInTheDocument();
    expect(screen.getByText('サニー・エドワーズ')).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: COUNTRY.USA })).toHaveLength(1);
    expect(screen.getByRole('img', { name: COUNTRY.UK })).toBeInTheDocument();
    expect(screen.queryByText('Hosber Perez')).not.toBeInTheDocument();
    expect(screen.queryByText('Sunny Edwards')).not.toBeInTheDocument();
    expect(screen.getAllByText('2026.08.30 SUN').length).toBeGreaterThan(0);
    expect(Array.from(container.querySelectorAll('time')).map((time) => time.getAttribute('datetime'))).toEqual([
      '2026-08-30',
      '2026-08-30',
    ]);
    expect(screen.getAllByText('バンタム級').length).toBeGreaterThan(0);
    expect(screen.getAllByText('T-Mobile Arena').length).toBeGreaterThan(0);
    expect(screen.queryByText('WBA')).not.toBeInTheDocument();
    expect(screen.queryByText('TITLE FIGHT')).not.toBeInTheDocument();
    expect(screen.queryByText('12R')).not.toBeInTheDocument();
  });

  test('タイトル数と会場の有無をカードへ反映する', () => {
    const { rerender } = render(<MatchCard matchData={makeMatch()} onClick={vi.fn()} />);

    expect(screen.getByRole('img', { name: '3団体タイトル戦' })).toHaveTextContent('★★★');

    rerender(
      <MatchCard matchData={makeMatch({ titles: [], venue: '   ' })} onClick={vi.fn()} />
    );
    expect(screen.queryByRole('img', { name: /団体タイトル戦/ })).not.toBeInTheDocument();
    expect(screen.queryByText('T-Mobile Arena')).not.toBeInTheDocument();
  });

  test('カードを押すと対象試合の詳細遷移を通知する', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MatchCard matchData={makeMatch()} onClick={onClick} />);
    const card = screen.getByRole('button');

    expect(card).toHaveAttribute('type', 'button');
    await user.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(42);
  });

});
