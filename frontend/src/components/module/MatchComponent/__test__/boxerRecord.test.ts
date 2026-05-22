import { describe, expect, it } from 'vitest';
import { getDisplayedBoxerRecord } from '../component/MatchInfo/components/helper/boxerRecord';

describe('getDisplayedBoxerRecord', () => {
  const boxer = {
    win: 10,
    ko: 5,
    draw: 2,
    lose: 1,
  };

  it.each([
    {
      name: '判定勝ちの場合は勝利数だけを増やす',
      resultState: 'win',
      isKo: false,
      expected: { win: 11, ko: 5, draw: 2, lose: 1 },
    },
    {
      name: 'KO勝ちの場合は勝利数とKO数を増やす',
      resultState: 'win',
      isKo: true,
      expected: { win: 11, ko: 6, draw: 2, lose: 1 },
    },
    {
      name: '引き分けの場合は引き分け数を増やす',
      resultState: 'draw',
      isKo: false,
      expected: { win: 10, ko: 5, draw: 3, lose: 1 },
    },
    {
      name: '敗北の場合は敗北数を増やす',
      resultState: 'loss',
      isKo: false,
      expected: { win: 10, ko: 5, draw: 2, lose: 2 },
    },
    {
      name: '結果がない場合は戦績を変更しない',
      resultState: null,
      isKo: false,
      expected: { win: 10, ko: 5, draw: 2, lose: 1 },
    },
  ] as const)('$name', ({ resultState, isKo, expected }) => {
    expect(getDisplayedBoxerRecord({ boxer, resultState, isKo })).toEqual(expected);
  });
});
