import '@testing-library/jest-dom/vitest';
import { expect, test } from 'vitest';
import { pickModifiedData } from "../functions"
import { WEIGHT_CLASS, GRADE } from '@/assets/boxerData';
import { COUNTRY } from '@/assets/nationalFlagData';

const originData = {
  match_date: '2024-2-28',
  grade: GRADE.R12,
  country: COUNTRY.AUSTRALIA,
  venue: 'match venue',
  weight: WEIGHT_CLASS.BANTAM,
  titles: [],
};


describe('pickModifiedDataのテスト', () => {
  test('変更されたデータのみを抽出している', () => {
    const modifiedData = { grade: GRADE.R10, venue: "change venue" }
    const formData = { ...originData, ...modifiedData }
    const picData = pickModifiedData({
      modifiedFormData: formData,
      originFormData: originData,
    });
    expect(picData).toEqual(modifiedData);
  });

  test('変更がない場合は空のオブジェクトを返す', () => {
    const modifiedData = {}
    const formData = { ...originData, ...modifiedData }
    const picData = pickModifiedData({
      modifiedFormData: formData,
      originFormData: originData,
    });

    expect(picData).toEqual({});
  });
});