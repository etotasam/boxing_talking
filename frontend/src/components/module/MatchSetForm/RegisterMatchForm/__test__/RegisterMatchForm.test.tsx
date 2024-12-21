import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from 'test-setup';
import { expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { WEIGHT_CLASS, GRADE } from '@/assets/boxerData';
import { COUNTRY } from '@/assets/nationalFlagData';
// import { useRegisterMatch } from '@/hooks/apiHooks/useMatch';

import { RegisterMatchFormWrapper } from '../RegisterMatchForm';

// elementの取得
const getSelectElement = (testId: string) => {
  return screen.getByTestId(testId) as HTMLSelectElement;
};

// ボタンクリック
const submitButtonClick = () => {
  const button = screen.getByTestId('submitButton') as HTMLButtonElement;
  userEvent.click(button);
};

// mock
const registerMatchMock = vi.fn();
vi.mock('@/hooks/apiHooks/useMatch', () => {
  return {
    useRegisterMatch: vi.fn(() => {
      return { registerMatch: registerMatchMock, isSuccess: false };
    }),
  };
});

const noSelectBoxerProps = {
  boxers: { red_boxer_id: undefined, blue_boxer_id: 2 },
  resetSelectedBoxers: () => {},
};
describe('RegisterMatchFormのテスト', () => {
  test('ボクサー未選択時はsubmit押下しても送信しない', async () => {
    render(<RegisterMatchFormWrapper {...noSelectBoxerProps} />);

    const grade = getSelectElement('matchGrade');
    const weight = getSelectElement('matchWeight');
    const country = getSelectElement('matchPlaceCountry');
    const venue = screen.getByTestId('matchVenue') as HTMLInputElement;

    userEvent.selectOptions(grade, GRADE.R12);
    userEvent.selectOptions(weight, WEIGHT_CLASS.BANTAM);
    userEvent.selectOptions(country, COUNTRY.CHINA);
    await userEvent.type(venue, '場所');

    submitButtonClick();

    await waitFor(() => {
      expect(grade.value).toEqual(GRADE.R12);
      expect(weight.value).toEqual(WEIGHT_CLASS.BANTAM);
      expect(country.value).toEqual(COUNTRY.CHINA);
      expect(venue.value).toEqual('場所');
      expect(registerMatchMock).not.toHaveBeenCalled();
    });
  });
});
