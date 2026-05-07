import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from 'test-setup';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { WEIGHT_CLASS, GRADE } from '@/constants/boxerData';

//! component
import { MatchSetFormContainer } from '../MatchSetFormContainer';
//! context
import { FormDataContextWrapper } from '../context/FormDataContextWrapper';
import { COUNTRY } from '@/constants/country';

const onSubmitFunc = vi.fn();

const rendering = async (isTitle: boolean = false) => {
  const result = render(
    <FormDataContextWrapper>
      <MatchSetFormContainer onSubmit={onSubmitFunc} title={isTitle} />
    </FormDataContextWrapper>
  );
  await waitFor(() => expect(screen.getByTestId('submitButton')).toBeTruthy());
  return result;
};

const submitButtonClick = async (user: ReturnType<typeof userEvent.setup>) => {
  const button = screen.getByTestId('submitButton') as HTMLButtonElement;
  expect(button).toBeTruthy();
  await user.click(button);
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
const setAllFormData = async (user: ReturnType<typeof userEvent.setup>) => {
  const { grade, weight, country, venue } = getAllElement();

  await user.selectOptions(grade, selectedGrade);
  await user.selectOptions(weight, selectedWeight);
  await user.selectOptions(country, selectedCountry);

  return { grade, weight, country, venue };
};

// mock
const showErrorToastMock = vi.fn();
const showNoticeToastMock = vi.fn();
const showSuccessToastMock = vi.fn();
vi.mock('@/hooks/useToastModal', () => {
  return {
    useToastModal: vi.fn(() => {
      return {
        hideToastModal: vi.fn(),
        showErrorToast: showErrorToastMock,
        showNoticeToast: showNoticeToastMock,
        showSuccessToast: showSuccessToastMock,
      };
    }),
  };
});

describe('MatchSetFormのテスト', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();
    await rendering();
    vi.clearAllMocks();
  });

  test('grade 未設定の時は送信出来ない', async () => {
    const { grade, weight, country, venue } = await setAllFormData(user);
    await user.type(venue, inputtedVenue);

    await user.selectOptions(grade, '');

    await submitButtonClick(user);

    await waitFor(() => {
      expect(grade.value).toEqual('');
      expect(weight.value).toEqual(selectedWeight);
      expect(country.value).toEqual(selectedCountry);
      expect(venue.value).toEqual(inputtedVenue);

      expect(showNoticeToastMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('weight 未設定の時は送信出来ない', async () => {
    const { grade, weight, country, venue } = await setAllFormData(user);
    await user.type(venue, inputtedVenue);

    await user.selectOptions(weight, '');

    await submitButtonClick(user);

    await waitFor(() => {
      expect(weight.value).toEqual('');
      expect(grade.value).toEqual(selectedGrade);
      expect(country.value).toEqual(selectedCountry);
      expect(venue.value).toEqual(inputtedVenue);

      expect(showNoticeToastMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('country 未設定の時は送信出来ない', async () => {
    const { grade, weight, country, venue } = await setAllFormData(user);
    await user.type(venue, inputtedVenue);

    await user.selectOptions(country, '');

    await submitButtonClick(user);

    await waitFor(() => {
      expect(country.value).toEqual('');
      expect(grade.value).toEqual(selectedGrade);
      expect(weight.value).toEqual(selectedWeight);
      expect(venue.value).toEqual(inputtedVenue);

      expect(showNoticeToastMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('venue 未設定の時は送信出来ない', async () => {
    const { grade, weight, country, venue } = await setAllFormData(user);

    await submitButtonClick(user);

    await waitFor(() => {
      expect(venue.value).toEqual('');
      expect(country.value).toEqual(selectedCountry);
      expect(grade.value).toEqual(selectedGrade);
      expect(weight.value).toEqual(selectedWeight);

      expect(showNoticeToastMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('grade がタイトルマッチで団体が未選択時は送信出来ない', async () => {
    const { grade, weight, country, venue } = await setAllFormData(user);

    await user.selectOptions(grade, GRADE.TITLE_MATCH);
    await user.type(venue, inputtedVenue);

    const title = getSelectElement('matchTitle_0') as HTMLSelectElement;

    await submitButtonClick(user);

    await waitFor(() => {
      expect(title.value).toEqual('');
      expect(venue.value).toEqual(inputtedVenue);
      expect(country.value).toEqual(selectedCountry);
      expect(grade.value).toEqual(GRADE.TITLE_MATCH);
      expect(weight.value).toEqual(selectedWeight);

      expect(showNoticeToastMock).toBeCalled();
      expect(onSubmitFunc).not.toBeCalled();
    });
  });

  test('データを満たしている場合はsubmit送信', async () => {
    const { grade, weight, country, venue } = await setAllFormData(user);
    await user.type(venue, inputtedVenue);

    await submitButtonClick(user);

    await waitFor(() => {
      expect(grade.value).toEqual(selectedGrade);
      expect(weight.value).toEqual(selectedWeight);
      expect(country.value).toEqual(selectedCountry);
      expect(venue.value).toEqual(inputtedVenue);

      expect(showSuccessToastMock).not.toBeCalled();
      expect(onSubmitFunc).toBeCalled();
    });
  });
});
