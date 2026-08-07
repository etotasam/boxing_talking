import '@testing-library/jest-dom/vitest';
import { render, screen } from 'test-setup';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
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

const DEFAULT_MATCH_ID = 42;
const makeMatch = (overrides: Partial<MatchDataType> = {}): MatchDataType => ({
  id: DEFAULT_MATCH_ID,
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

  afterEach(() => {
    vi.useRealTimers();
  });

  test('カードの押下で対象試合IDを通知する', async () => {
    const targetMatchId = 99;
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MatchCard matchData={makeMatch({ id: targetMatchId })} onClick={onClick} />);
    const card = screen.getByRole('button');

    expect(card).toHaveAttribute('type', 'button');
    await user.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(targetMatchId);
  });

  test('日本時間で当日・翌日の試合日を強調する', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-06T15:30:00.000Z'));

    const { container, rerender } = render(
      <MatchCard matchData={makeMatch({ matchDate: '2026-08-07' })} onClick={vi.fn()} />
    );

    const expectMatchDateClass = (dateTime: string, className: string) => {
      const dates = container.querySelectorAll(`time[datetime="${dateTime}"]`);
      expect(dates.length).toBeGreaterThan(0);
      dates.forEach((date) => expect(date).toHaveClass(className));
    };

    expectMatchDateClass('2026-08-07', 'text-[#D99A2B]');

    rerender(<MatchCard matchData={makeMatch({ matchDate: '2026-08-08' })} onClick={vi.fn()} />);

    expectMatchDateClass('2026-08-08', 'text-[#D99A2B]');

    rerender(<MatchCard matchData={makeMatch({ matchDate: '2026-08-06' })} onClick={vi.fn()} />);

    expectMatchDateClass('2026-08-06', 'text-[#F5F2E9]');
  });
});
