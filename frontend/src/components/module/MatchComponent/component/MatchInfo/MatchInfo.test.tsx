import '@testing-library/jest-dom/vitest';
import { within } from '@testing-library/react';
import { fireEvent, render, screen } from 'test-setup';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MatchInfo } from './MatchInfo';
import { initialBoxerData, GRADE, WEIGHT_CLASS } from '@/constants/boxerData';
import { COUNTRY } from '@/constants/country';

const matchData = {
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
};

const showPredictionModal = vi.fn();

describe('MatchInfo', () => {
  beforeEach(() => {
    showPredictionModal.mockClear();
  });

  test('userPrediction がある時は自分の予想を表示する', () => {
    render(<MatchInfo matchData={matchData} userPrediction="red" />);

    const predictionSummary = screen.getByRole('region', { name: 'prediction-summary' });
    expect(within(predictionSummary).getByText('Red Boxer')).toBeInTheDocument();
  });

  test('試合日時と試合会場を表示する', () => {
    render(<MatchInfo matchData={matchData} />);

    expect(screen.getByText('試合日時')).toBeInTheDocument();
    expect(screen.getByText('2026年1月1日（木）')).toBeInTheDocument();
    expect(screen.getByText('日本時間')).toBeInTheDocument();
    expect(screen.getByText('試合会場')).toBeInTheDocument();
    expect(screen.getByText('Tokyo Dome')).toBeInTheDocument();
  });

  test('未投票で投票可能な時は投票ボタンを表示する', () => {
    render(
      <MatchInfo
        matchData={matchData}
        userPrediction={false}
        isShowVoteButton={true}
        showPredictionModal={showPredictionModal}
      />
    );

    const voteButton = screen.getByRole('button', { name: '投票' });
    expect(voteButton).toBeInTheDocument();

    fireEvent.click(voteButton);
    expect(showPredictionModal).toHaveBeenCalledTimes(1);
  });

  test('未投票で投票不可の時はあなたの予想を表示しない', () => {
    render(<MatchInfo matchData={matchData} userPrediction={false} isShowVoteButton={false} />);

    expect(screen.queryByRole('button', { name: '投票' })).not.toBeInTheDocument();
  });

  test('matchPredictions がある時は集計結果を表示する', () => {
    render(
      <MatchInfo
        matchData={matchData}
        matchPredictions={{
          totalVotes: 12,
          red: 7,
          blue: 5,
        }}
      />
    );

    expect(screen.getByLabelText('合計 12票')).toBeInTheDocument();
    expect(screen.getByText('7票')).toBeInTheDocument();
    expect(screen.getByText('5票')).toBeInTheDocument();
    expect(screen.getByText('58%')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();

    const predictionSummary = screen.getByRole('region', { name: 'prediction-summary' });
    expect(within(predictionSummary).queryByText('Red Boxer')).not.toBeInTheDocument();
    expect(within(predictionSummary).queryByText('Blue Boxer')).not.toBeInTheDocument();
    expect(within(predictionSummary).queryByText(/vs/i)).not.toBeInTheDocument();
  });

  test('初回取得中はローディング表示を出す', () => {
    render(
      <MatchInfo
        matchData={matchData}
        matchPredictions={undefined}
        isMatchPredictionsLoading={true}
      />
    );

    expect(screen.getByText('勝敗予想を読み込み中...')).toBeInTheDocument();
  });

  test('初回取得中ではなく matchPredictions がない時は取得中表示を出す', () => {
    render(<MatchInfo matchData={matchData} matchPredictions={undefined} />);

    expect(screen.getByText('取得中')).toBeInTheDocument();
  });
});
