import '@testing-library/jest-dom/vitest';
import { render, screen } from 'test-setup';
import userEvent from '@testing-library/user-event';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { COUNTRY } from '@/constants/country';
import { GRADE, ORGANIZATIONS, WEIGHT_CLASS, STANCE } from '@/constants/boxerData';
import { MatchDataType } from '@/types';
import { MatchCard } from '@/components/module/MatchCard';
import { deviceState, DeviceStateType } from '@/store/deviceState';

const mockUseVoteIconState = vi.fn();

vi.mock('@/hooks/useVoteIconState', () => ({
  useVoteIconState: (props: unknown) => mockUseVoteIconState(props),
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

const DeviceSwitchButtons = () => {
  const setDevice = useSetRecoilState(deviceState);

  return (
    <>
      <button type="button" onClick={() => setDevice('PC')}>
        PCに切替
      </button>
      <button type="button" onClick={() => setDevice('SP')}>
        SPに切替
      </button>
    </>
  );
};

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

  test.each<DeviceStateType>(['PC', 'SP'])(
    '%sでは日時欄と未投票バッジを1件だけ表示する',
    (device) => {
      mockUseVoteIconState.mockReturnValue(true);

      const { container } = render(
        <RecoilRoot initializeState={({ set }) => set(deviceState, device)}>
          <MatchCard matchData={makeMatch()} onClick={vi.fn()} />
        </RecoilRoot>
      );

      const badges = screen.getAllByRole('img', { name: '勝敗予想が未投票' });
      expect(badges).toHaveLength(1);
      expect(container.querySelectorAll('time')).toHaveLength(1);
      badges.forEach((badge) => expect(badge.closest('time')).toBeInTheDocument());
    }
  );

  test('PC/SPを切り替えても日付・階級・会場・未投票バッジを重複なく表示する', async () => {
    mockUseVoteIconState.mockReturnValue(true);
    const user = userEvent.setup();
    const { container } = render(
      <>
        <MatchCard matchData={makeMatch()} onClick={vi.fn()} />
        <DeviceSwitchButtons />
      </>
    );

    const expectMetadata = () => {
      expect(container.querySelectorAll('time')).toHaveLength(1);
      expect(screen.getByText('2026.08.30 SUN')).toBeInTheDocument();
      expect(screen.getByText(`${WEIGHT_CLASS.BANTAM}級`)).toBeInTheDocument();
      expect(screen.getByText('T-Mobile Arena')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: '勝敗予想が未投票' })).toBeInTheDocument();
    };

    expectMetadata();
    const mobileDate = container.querySelector('time');
    await user.click(screen.getByRole('button', { name: 'PCに切替' }));
    expect(mobileDate).not.toBeInTheDocument();
    expectMetadata();
    const desktopDate = container.querySelector('time');
    await user.click(screen.getByRole('button', { name: 'SPに切替' }));
    expect(desktopDate).not.toBeInTheDocument();
    expectMetadata();
  });

  test('投票済みまたは投票不可の試合では勝敗予想バッジを表示しない', () => {
    render(<MatchCard matchData={makeMatch()} onClick={vi.fn()} />);

    expect(screen.queryByRole('img', { name: '勝敗予想が未投票' })).not.toBeInTheDocument();
  });

  test.each<DeviceStateType>(['PC', 'SP'])(
    '%sで日本時間の当日・翌日の試合日を強調する',
    (device) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-06T15:30:00.000Z'));

      const card = (matchDate: string) => (
        <RecoilRoot initializeState={({ set }) => set(deviceState, device)}>
          <MatchCard matchData={makeMatch({ matchDate })} onClick={vi.fn()} />
        </RecoilRoot>
      );
      const { container, rerender } = render(card('2026-08-07'));

      const expectMatchDateClass = (dateTime: string, className: string) => {
        const dates = container.querySelectorAll(`time[datetime="${dateTime}"]`);
        expect(dates.length).toBeGreaterThan(0);
        dates.forEach((date) => expect(date).toHaveClass(className));
      };

      expectMatchDateClass('2026-08-07', 'text-[#D99A2B]');

      rerender(card('2026-08-08'));

      expectMatchDateClass('2026-08-08', 'text-[#D99A2B]');

      rerender(card('2026-08-06'));

      expectMatchDateClass('2026-08-06', 'text-[#F5F2E9]');
    }
  );
});
