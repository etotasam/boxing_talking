import '@testing-library/jest-dom/vitest';
import { render, screen, within } from 'test-setup';
import { describe, expect, test } from 'vitest';
import { COUNTRY } from '@/constants/country';
import { initialBoxerData, STANCE } from '@/constants/boxerData';
import { TaleOfTheTape } from '../components/TaleOfTheTape';

const redBoxer = {
  ...initialBoxerData,
  id: 1,
  birth: '1990-06-15',
  height: 175,
  reach: 180,
  style: STANCE.ORTHODOX,
};

const blueBoxer = {
  ...initialBoxerData,
  id: 2,
  country: COUNTRY.USA,
  birth: '1992-06-15',
  height: 178,
  reach: 185,
  style: STANCE.SOUTHPAW,
};

describe('TaleOfTheTape', () => {
  test('試合日時点の両選手のデータを比較表示する', () => {
    render(<TaleOfTheTape redBoxer={redBoxer} blueBoxer={blueBoxer} matchDate="2025-06-15" />);

    const taleOfTheTape = screen.getByRole('region', { name: 'Tale of the Tape' });

    expect(within(taleOfTheTape).getByRole('row', { name: '35 年齢 33' })).toBeInTheDocument();
    expect(
      within(taleOfTheTape).getByRole('row', { name: '175cm 身長 178cm' })
    ).toBeInTheDocument();
    expect(
      within(taleOfTheTape).getByRole('row', { name: '180cm リーチ 185cm' })
    ).toBeInTheDocument();
    expect(
      within(taleOfTheTape).getByRole('row', { name: 'オーソドックス スタイル サウスポー' })
    ).toBeInTheDocument();
  });

  test('身長とリーチが未設定の場合はハイフンを表示する', () => {
    render(
      <TaleOfTheTape
        redBoxer={{ ...redBoxer, height: 0, reach: 0 }}
        blueBoxer={blueBoxer}
        matchDate="2025-06-15"
      />
    );

    const taleOfTheTape = screen.getByRole('region', { name: 'Tale of the Tape' });

    expect(within(taleOfTheTape).getByRole('row', { name: '- 身長 178cm' })).toBeInTheDocument();
    expect(within(taleOfTheTape).getByRole('row', { name: '- リーチ 185cm' })).toBeInTheDocument();
  });
});
