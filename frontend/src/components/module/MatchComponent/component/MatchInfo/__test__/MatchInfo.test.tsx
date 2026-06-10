import '@testing-library/jest-dom/vitest';
import { within } from '@testing-library/react';
import { fireEvent, render, screen } from 'test-setup';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MatchInfo } from '../MatchInfo';
import { initialBoxerData, GRADE, WEIGHT_CLASS } from '@/constants/boxerData';
import { COUNTRY } from '@/constants/country';

const matchData = {
  id: 1,
  redBoxer: {
    ...initialBoxerData,
    id: 10,
    name: 'Red Boxer',
    engName: 'Red Boxer',
    win: 10,
    ko: 5,
    draw: 2,
    lose: 1,
  },
  blueBoxer: {
    ...initialBoxerData,
    id: 20,
    name: 'Blue Boxer',
    engName: 'Blue Boxer',
    country: COUNTRY.USA,
    win: 8,
    ko: 3,
    draw: 1,
    lose: 2,
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

const expectVisibleRecordText = (container: HTMLElement, text: string) => {
  const matchedElements = within(container).getAllByText((_, element) => {
    return element?.tagName.toLowerCase() === 'span' && element.textContent === text;
  });

  expect(matchedElements.length).toBeGreaterThan(0);
};

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

  test('ボクサーの名前、戦績、国籍を表示する', () => {
    render(<MatchInfo matchData={matchData} />);

    const boxersSummary = screen.getByRole('region', { name: 'boxers-summary' });

    expect(within(boxersSummary).getByText('Red Boxer')).toBeInTheDocument();
    expectVisibleRecordText(boxersSummary, '10勝');
    expectVisibleRecordText(boxersSummary, '5KO');
    expectVisibleRecordText(boxersSummary, '1敗');
    expectVisibleRecordText(boxersSummary, '2分');
    expect(within(boxersSummary).getByText('日本')).toBeInTheDocument();
    expect(within(boxersSummary).getByText('Blue Boxer')).toBeInTheDocument();
    expectVisibleRecordText(boxersSummary, '8勝');
    expectVisibleRecordText(boxersSummary, '3KO');
    expectVisibleRecordText(boxersSummary, '2敗');
    expectVisibleRecordText(boxersSummary, '1分');
    expect(within(boxersSummary).getByText('アメリカ')).toBeInTheDocument();
    expect(within(boxersSummary).getByText('VS')).toBeInTheDocument();
  });

  test('試合結果がある時は戦績表示に反映する', () => {
    render(
      <MatchInfo
        matchData={{
          ...matchData,
          result: {
            isUpdateBoxerRecordChecked: true,
            matchId: matchData.id,
            result: 'red',
            detail: 'ko',
          },
        }}
      />
    );

    const boxersSummary = screen.getByRole('region', { name: 'boxers-summary' });

    expectVisibleRecordText(boxersSummary, '11勝');
    expectVisibleRecordText(boxersSummary, '6KO');
    expectVisibleRecordText(boxersSummary, '3敗');
  });

  test('試合結果がある時は結果サマリーを表示する', () => {
    render(
      <MatchInfo
        matchData={{
          ...matchData,
          result: {
            isUpdateBoxerRecordChecked: true,
            matchId: matchData.id,
            result: 'blue',
            detail: 'sd',
          },
        }}
      />
    );

    const resultSummary = screen.getByLabelText('match-result-summary');
    expect(within(resultSummary).getByText('LOSE')).toBeInTheDocument();
    expect(within(resultSummary).getByText('判定 1-2')).toBeInTheDocument();
    expect(within(resultSummary).getByText('WIN')).toBeInTheDocument();
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

  test('userPrediction が未取得の時は投票状態を表示しない', () => {
    render(
      <MatchInfo
        matchData={matchData}
        userPrediction={undefined}
        isShowVoteButton={true}
        showPredictionModal={showPredictionModal}
      />
    );

    const predictionSummary = screen.getByRole('region', { name: 'prediction-summary' });
    expect(within(predictionSummary).queryByText('Red Boxer')).not.toBeInTheDocument();
    expect(within(predictionSummary).queryByText('Blue Boxer')).not.toBeInTheDocument();
    expect(
      within(predictionSummary).queryByRole('button', { name: '投票' })
    ).not.toBeInTheDocument();
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
