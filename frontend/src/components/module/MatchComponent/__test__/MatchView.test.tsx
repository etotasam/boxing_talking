import '@testing-library/jest-dom/vitest';
import { render, screen } from 'test-setup';
import { describe, expect, test, vi } from 'vitest';
import { MatchView, MatchViewProps } from '../MatchView';
import { initialBoxerData, GRADE, WEIGHT_CLASS } from '@/assets/boxerData';
import { COUNTRY } from '@/assets/nationalFlagData';

vi.mock('../component/MatchInfo', () => ({
  MatchInfo: ({ matchData }: { matchData: { id: number } }) => (
    <div data-testid="match-info">{matchData.id}</div>
  ),
}));

vi.mock('../component/PostComment', () => ({
  PostComment: () => <div data-testid="post-comment" />,
}));

vi.mock('../component/PredictionVoteModal', () => ({
  PredictionVoteModal: ({ thisMatch }: { thisMatch: { id: number } }) => (
    <div data-testid="prediction-vote-modal">{thisMatch.id}</div>
  ),
}));

vi.mock('../component/VoteIcon', () => ({
  VoteIcon: ({
    isScroll,
    bottomPosition,
  }: {
    isScroll: boolean;
    bottomPosition: number;
  }) => (
    <div
      data-testid="vote-icon"
      data-is-scroll={String(isScroll)}
      data-bottom-position={String(bottomPosition)}
    />
  ),
}));

vi.mock('../component/MatchCommentsModal', () => ({
  MatchCommentsModal: ({ matchId }: { matchId: number }) => (
    <div data-testid="match-comments-modal">{matchId}</div>
  ),
}));

const showPredictionModal = vi.fn();

const defaultProps: MatchViewProps = {
  matchData: {
    id: 1,
    redBoxer: {
      ...initialBoxerData,
      id: 10,
      name: 'Red Boxer',
      engName: 'Red Boxer',
    },
    blueBoxer: {
      ...initialBoxerData,
      id: 20,
      name: 'Blue Boxer',
      engName: 'Blue Boxer',
    },
    country: COUNTRY.JAPAN,
    venue: 'Tokyo Dome',
    grade: GRADE.R12,
    titles: [],
    weight: WEIGHT_CLASS.BANTAM,
    matchDate: '2026-01-01',
    result: null,
  },
  userPrediction: undefined,
  matchPredictions: undefined,
  isMatchPredictionsLoading: false,
  device: 'SP',
  isShowPredictionModal: false,
  showPredictionModal,
  isShowVoteIcon: true,
  isScroll: true,
  voteIconBottomPosition: 45,
  commentsModalHeightHiddenState: 120,
};

const renderComponent = (props?: Partial<MatchViewProps>) => {
  return render(<MatchView {...defaultProps} {...props} />);
};

describe('MatchView', () => {
  test('isShowVoteIcon=true の時は VoteIcon を表示する', () => {
    renderComponent();

    const voteIcon = screen.getByTestId('vote-icon');
    expect(voteIcon).toBeInTheDocument();
    expect(voteIcon).toHaveAttribute('data-is-scroll', 'true');
    expect(voteIcon).toHaveAttribute('data-bottom-position', '45');
  });

  test('isShowVoteIcon=false の時は VoteIcon を表示しない', () => {
    renderComponent({ isShowVoteIcon: false });

    expect(screen.queryByTestId('vote-icon')).not.toBeInTheDocument();
  });

  test('isShowPredictionModal=true の時は PredictionVoteModal を表示する', () => {
    renderComponent({ isShowPredictionModal: true });

    expect(screen.getByTestId('prediction-vote-modal')).toBeInTheDocument();
  });

  test('commentsModalHeightHiddenState を MainContent のレイアウトに反映する', () => {
    renderComponent({ commentsModalHeightHiddenState: 180 });

    const mainContent = screen.getByTestId('match-main-content');
    expect(mainContent).toHaveStyle({ paddingBottom: '180px' });
  });
});
