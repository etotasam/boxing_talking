import { render, screen, waitFor } from 'test-setup';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { WEIGHT_CLASS, GRADE } from '@/assets/boxerData';

//! component
import { MatchSetFormContainer } from '../MatchSetFormContainer';
//! context
import { FormDataContextWrapper } from '../FormDataContextWrapper';
import { COUNTRY } from '@/assets/nationalFlagData';

const onSubmitFunc = vi.fn();

const rendering = (isTitle: boolean = false) => {
  return render(
    <FormDataContextWrapper>
      <MatchSetFormContainer onSubmit={onSubmitFunc} title={isTitle} />
    </FormDataContextWrapper>
  );
};

const submitButtonClick = () => {
  const button = screen.getByTestId('submitButton') as HTMLButtonElement;
  expect(button).toBeTruthy();
  userEvent.click(button);
};

const getSelectElement = (testId: string) => {
  return screen.getByTestId(testId) as HTMLSelectElement;
};

const getAllElement = () => {
  const grade = getSelectElement('matchGrade');
  const weight = getSelectElement('matchWeight');
  const country = getSelectElement('matchPlaceCountry');
  const venue = screen.getByTestId('matchVenue') as HTMLInputElement;

  return { grade, weight, country, venue };
};

const selectedGrade = GRADE.R12;
const selectedWeight = WEIGHT_CLASS.BANTAM;
const selectedCountry = COUNTRY.JAPAN;
const inputtedVenue = 'match venue';
const setAllFormData = () => {
  const { grade, weight, country, venue } = getAllElement();

  userEvent.selectOptions(grade, selectedGrade);
  userEvent.selectOptions(weight, selectedWeight);
  userEvent.selectOptions(country, selectedCountry);

  return { grade, weight, country, venue };
};

// mock
const showToastModalMessageMock = vi.fn();
vi.mock('@/hooks/useToastModal', () => {
  return {
    useToastModal: vi.fn(() => {
      return {
        hideToastModal: vi.fn(),
        showToastModalMessage: showToastModalMessageMock,
      };
    }),
  };
});

describe('MatchSetFormのテスト', () => {
  beforeEach(() => {
    rendering();
    vi.clearAllMocks();
  });

  test('grade 未設定の時は送信出来ない', async () => {
    const { grade, weight, country, venue } = setAllFormData();
    await userEvent.type(venue, inputtedVenue);

    userEvent.selectOptions(grade, '');

    submitButtonClick();

    await waitFor(() => {
      expect(grade.value).toEqual('');
      expect(weight.value).toEqual(selectedWeight);
      expect(country.value).toEqual(selectedCountry);
      expect(venue.value).toEqual(inputtedVenue);

      expect(showToastModalMessageMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('weight 未設定の時は送信出来ない', async () => {
    const { grade, weight, country, venue } = setAllFormData();
    await userEvent.type(venue, inputtedVenue);

    userEvent.selectOptions(weight, '');

    submitButtonClick();

    await waitFor(() => {
      expect(weight.value).toEqual('');
      expect(grade.value).toEqual(selectedGrade);
      expect(country.value).toEqual(selectedCountry);
      expect(venue.value).toEqual(inputtedVenue);

      expect(showToastModalMessageMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('country 未設定の時は送信出来ない', async () => {
    const { grade, weight, country, venue } = setAllFormData();
    await userEvent.type(venue, inputtedVenue);

    userEvent.selectOptions(country, '');

    submitButtonClick();

    await waitFor(() => {
      expect(country.value).toEqual('');
      expect(grade.value).toEqual(selectedGrade);
      expect(weight.value).toEqual(selectedWeight);
      expect(venue.value).toEqual(inputtedVenue);

      expect(showToastModalMessageMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('venue 未設定の時は送信出来ない', async () => {
    const { grade, weight, country, venue } = setAllFormData();

    submitButtonClick();

    await waitFor(() => {
      expect(venue.value).toEqual('');
      expect(country.value).toEqual(selectedCountry);
      expect(grade.value).toEqual(selectedGrade);
      expect(weight.value).toEqual(selectedWeight);

      expect(showToastModalMessageMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('grade がタイトルマッチで団体が未選択時は送信出来ない', async () => {
    const { grade, weight, country, venue } = setAllFormData();

    userEvent.selectOptions(grade, GRADE.TITLE_MATCH);
    await userEvent.type(venue, inputtedVenue);

    const title = getSelectElement('matchTitle_0') as HTMLSelectElement;

    await waitFor(() => {
      expect(title.value).toEqual('');
      expect(venue.value).toEqual(inputtedVenue);
      expect(country.value).toEqual(selectedCountry);
      expect(grade.value).toEqual(GRADE.TITLE_MATCH);
      expect(weight.value).toEqual(selectedWeight);

      submitButtonClick();

      expect(showToastModalMessageMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('データを満たしている場合はsubmit送信', async () => {
    const { grade, weight, country, venue } = setAllFormData();
    await userEvent.type(venue, inputtedVenue);

    submitButtonClick();

    await waitFor(() => {
      expect(grade.value).toEqual(selectedGrade);
      expect(weight.value).toEqual(selectedWeight);
      expect(country.value).toEqual(selectedCountry);
      expect(venue.value).toEqual(inputtedVenue);

      expect(showToastModalMessageMock).not.toBeCalled();
      expect(onSubmitFunc).toBeCalled();
    });
  });
});
