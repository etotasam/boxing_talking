import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from 'test-setup';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MatchView, MatchViewProps } from '../MatchView';
import { initialBoxerData, GRADE, WEIGHT_CLASS } from '@/constants/boxerData';
import { COUNTRY } from '@/constants/country';

vi.mock('../component/MatchInfo', () => ({
  MatchInfo: ({
    matchData,
    isShowVoteButton,
    showPredictionModal,
  }: {
    matchData: { id: number };
    isShowVoteButton: boolean;
    showPredictionModal: () => void;
  }) => (
    <div data-testid="match-info" data-is-show-vote-button={String(isShowVoteButton)}>
      <span>{matchData.id}</span>
      <button type="button" data-testid="match-info-vote-button" onClick={showPredictionModal}>
        投票する
      </button>
    </div>
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
  isShowPredictionModal: false,
  showPredictionModal,
  isShowVoteIcon: true,
  commentsModalHeightHiddenState: 120,
};

const renderComponent = (props?: Partial<MatchViewProps>) => {
  return render(<MatchView {...defaultProps} {...props} />);
};

describe('MatchView', () => {
  beforeEach(() => {
    showPredictionModal.mockClear();
  });

  test('isShowVoteIcon=true の時は MatchInfo に投票ボタン表示フラグを渡す', () => {
    renderComponent();

    expect(screen.getByTestId('match-info')).toHaveAttribute('data-is-show-vote-button', 'true');

    fireEvent.click(screen.getByTestId('match-info-vote-button'));
    expect(showPredictionModal).toHaveBeenCalledTimes(1);
  });

  test('isShowVoteIcon=false の時は MatchInfo に投票ボタン非表示フラグを渡す', () => {
    renderComponent({ isShowVoteIcon: false });

    expect(screen.getByTestId('match-info')).toHaveAttribute('data-is-show-vote-button', 'false');
  });

  test('isShowPredictionModal=true の時は PredictionVoteModal を表示する', () => {
    renderComponent({ isShowPredictionModal: true });

    expect(screen.getByTestId('prediction-vote-modal')).toBeInTheDocument();
  });

  test('commentsModalHeightHiddenState の差分を MainContent のレイアウトに反映する', () => {
    const { rerender } = renderComponent({ commentsModalHeightHiddenState: 180 });

    const mainContent = screen.getByTestId('match-main-content');
    const initialPaddingBottom = Number.parseInt(mainContent.style.paddingBottom, 10);

    rerender(<MatchView {...defaultProps} commentsModalHeightHiddenState={220} />);

    const updatedPaddingBottom = Number.parseInt(mainContent.style.paddingBottom, 10);
    expect(updatedPaddingBottom - initialPaddingBottom).toBe(40);
  });
});
