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
    name: '赤ボクサー',
    engName: 'Red Boxer',
    win: 10,
    ko: 5,
    draw: 2,
    lose: 1,
  },
  blueBoxer: {
    ...initialBoxerData,
    id: 20,
    name: '青ボクサー',
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

  test('赤ボクサーに投票済みの時は投票先を表示し、投票ボタンを表示しない', () => {
    render(
      <MatchInfo
        matchData={matchData}
        userPrediction="red"
        matchPredictions={{ isVisible: true, totalVotes: 1, red: 1, blue: 0 }}
      />
    );

    const predictionSummary = screen.getByRole('region', { name: 'prediction-summary' });
    const redPrediction = within(predictionSummary).getByLabelText('赤コーナーの投票結果');
    const bluePrediction = within(predictionSummary).getByLabelText('青コーナーの投票結果');
    expect(within(predictionSummary).queryByRole('button')).not.toBeInTheDocument();
    expect(within(redPrediction).getByText('あなたの投票')).toBeInTheDocument();
    expect(within(bluePrediction).queryByText('あなたの投票')).not.toBeInTheDocument();
    expect(within(predictionSummary).queryByText('赤ボクサー')).not.toBeInTheDocument();
  });

  test('青ボクサーに投票済みの時も投票先を表示する', () => {
    render(
      <MatchInfo
        matchData={matchData}
        userPrediction="blue"
        matchPredictions={{ isVisible: true, totalVotes: 1, red: 0, blue: 1 }}
      />
    );

    const predictionSummary = screen.getByRole('region', { name: 'prediction-summary' });
    const redPrediction = within(predictionSummary).getByLabelText('赤コーナーの投票結果');
    const bluePrediction = within(predictionSummary).getByLabelText('青コーナーの投票結果');
    expect(within(bluePrediction).getByText('あなたの投票')).toBeInTheDocument();
    expect(within(redPrediction).queryByText('あなたの投票')).not.toBeInTheDocument();
    expect(within(predictionSummary).queryByRole('button')).not.toBeInTheDocument();
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

    expect(within(boxersSummary).getByText('赤ボクサー')).toBeInTheDocument();
    expect(within(boxersSummary).getByText('Red Boxer')).toBeInTheDocument();
    expectVisibleRecordText(boxersSummary, '10勝');
    expectVisibleRecordText(boxersSummary, '5KO');
    expectVisibleRecordText(boxersSummary, '1敗');
    expectVisibleRecordText(boxersSummary, '2分');
    expect(within(boxersSummary).getByText('日本')).toBeInTheDocument();
    expect(within(boxersSummary).getByText('青ボクサー')).toBeInTheDocument();
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
        matchPredictions={{ isVisible: false, totalVotes: null, red: null, blue: null }}
        isShowVoteButton={true}
        showPredictionModal={showPredictionModal}
      />
    );

    expect(screen.getByText('投票すると予想を確認できます')).toBeInTheDocument();
    const voteButton = screen.getByRole('button', { name: '勝者を予想する' });
    expect(voteButton).toBeInTheDocument();

    fireEvent.click(voteButton);
    expect(showPredictionModal).toHaveBeenCalledTimes(1);
  });

  test('未投票で投票不可の時はあなたの予想を表示しない', () => {
    render(<MatchInfo matchData={matchData} userPrediction={false} isShowVoteButton={false} />);

    expect(screen.queryByRole('button', { name: '勝者を予想する' })).not.toBeInTheDocument();
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
    expect(within(predictionSummary).queryByText('赤ボクサー')).not.toBeInTheDocument();
    expect(within(predictionSummary).queryByText('青ボクサー')).not.toBeInTheDocument();
    expect(
      within(predictionSummary).queryByRole('button', { name: '勝者を予想する' })
    ).not.toBeInTheDocument();
  });

  test('matchPredictions がある時は集計結果を表示する', () => {
    render(
      <MatchInfo
        matchData={matchData}
        matchPredictions={{
          isVisible: true,
          totalVotes: 12,
          red: 7,
          blue: 5,
        }}
      />
    );

    const totalVotes = screen.getByLabelText('合計 12票');
    expect(totalVotes).toHaveTextContent('12票');
    expect(totalVotes.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByText('7票')).not.toBeInTheDocument();
    expect(screen.queryByText('5票')).not.toBeInTheDocument();
    expect(screen.getByLabelText('赤コーナーの投票結果')).toHaveTextContent('58%');
    expect(screen.getByLabelText('青コーナーの投票結果')).toHaveTextContent('42%');

    const predictionSummary = screen.getByRole('region', { name: 'prediction-summary' });
    expect(within(predictionSummary).queryByText('赤ボクサー')).not.toBeInTheDocument();
    expect(within(predictionSummary).queryByText('青ボクサー')).not.toBeInTheDocument();
    expect(within(predictionSummary).queryByText(/vs/i)).not.toBeInTheDocument();
  });

  test('未投票で投票可能でも集計結果が公開されている時は投票ボタンを表示しない', () => {
    render(
      <MatchInfo
        matchData={matchData}
        userPrediction={false}
        matchPredictions={{ isVisible: true, totalVotes: 12, red: 7, blue: 5 }}
        isShowVoteButton={true}
        showPredictionModal={showPredictionModal}
      />
    );

    expect(screen.getByLabelText('合計 12票')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '勝者を予想する' })).not.toBeInTheDocument();
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

  test('集計結果を取得できなかった時はエラー表示を出す', () => {
    render(<MatchInfo matchData={matchData} matchPredictions={undefined} />);

    expect(screen.getByText('勝敗予想を取得できませんでした')).toBeInTheDocument();
  });

  test('未投票で集計結果が非公開の時は票数を表示しない', () => {
    render(
      <MatchInfo
        matchData={matchData}
        userPrediction={false}
        matchPredictions={{ isVisible: false, totalVotes: null, red: null, blue: null }}
      />
    );

    expect(screen.getByText('投票すると予想を確認できます')).toBeInTheDocument();
    expect(screen.queryByLabelText(/合計 .*票/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('赤コーナーの投票結果')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('青コーナーの投票結果')).not.toBeInTheDocument();
  });
});
