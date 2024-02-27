// import { screen, waitFor } from '@testing-library/react';
import { render, screen, waitFor } from '../../../../jest-setup';
import userEvent from '@testing-library/user-event';
import { COUNTRY } from '@/assets/nationalFlagData';
//! component
import { MatchSetFormContainer } from './MatchSetFormContainer';
//! context
import { FormDataContextWrapper } from './FormDataContextWrapper';

describe('Rendering', () => {
  it('レンダリングテスト', async () => {
    render(
      <FormDataContextWrapper>
        <MatchSetFormContainer onSubmit={() => {}} />
      </FormDataContextWrapper>
    );

    const selectElement = screen.getByTestId(
      'matchPlaceCountry'
    ) as HTMLSelectElement;

    expect(selectElement).toBeInTheDocument();
    userEvent.selectOptions(selectElement, COUNTRY.MEXICO);

    await waitFor(() => {
      expect(selectElement.value).toEqual(COUNTRY.MEXICO);
    });
  });
});
