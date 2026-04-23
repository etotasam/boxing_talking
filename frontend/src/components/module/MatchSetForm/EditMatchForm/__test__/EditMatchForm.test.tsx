import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from 'test-setup';
import { expect, test, vi, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { WEIGHT_CLASS, GRADE } from '@/constants/boxerData';
import { COUNTRY } from '@/constants/country';

import { EditMatchFormWrapper } from '../EditMatchForm';

// elementの取得
const getSelectElement = (testId: string) => {
  return screen.getByTestId(testId) as HTMLSelectElement;
};

// ボタンクリック
const submitButtonClick = async () => {
  const button = screen.getByTestId('submitButton') as HTMLButtonElement;
  userEvent.click(button);
};

// mock
const updateMatchMock = vi.fn();
vi.mock('@/hooks/apiHooks/useMatch', () => {
  return {
    useUpdateMatch: vi.fn(() => {
      return { updateMatch: updateMatchMock };
    }),
  };
});

const noSelectBoxerProps = {
  selectedMatch: undefined,
  isSuccessDeleteMatch: false,
};
describe('EditMatchFormのテスト', () => {
  test('対象試合が未選択時はsubmit押下しても送信しない', async () => {
    render(<EditMatchFormWrapper {...noSelectBoxerProps} />);
    await waitFor(() => expect(screen.getByTestId('submitButton')).toBeTruthy());

    const grade = getSelectElement('matchGrade');
    const weight = getSelectElement('matchWeight');
    const country = getSelectElement('matchPlaceCountry');
    const venue = screen.getByTestId('matchVenue') as HTMLInputElement;

    await userEvent.selectOptions(grade, GRADE.R12);
    await userEvent.selectOptions(weight, WEIGHT_CLASS.BANTAM);
    await userEvent.selectOptions(country, COUNTRY.CHINA);
    await userEvent.type(venue, '会場の場所を指定');

    await submitButtonClick();

    await waitFor(() => {
      expect(grade.value).toEqual(GRADE.R12);
      expect(weight.value).toEqual(WEIGHT_CLASS.BANTAM);
      expect(country.value).toEqual(COUNTRY.CHINA);
      expect(venue.value).toEqual('会場の場所を指定');
      expect(updateMatchMock).not.toHaveBeenCalled();
    });
  });
});
