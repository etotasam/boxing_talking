import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// import { COUNTRY } from '@/assets/nationalFlagData';
//! component
import { MatchSetForm } from './MatchSetForm';

const updateMatchExecute = () => {};
const formData = {
  match_date: '',
  grade: undefined,
  country: undefined,
  venue: '',
  weight: undefined,
  titles: [],
};
const isTitle = false;
const onChange = () => {};
const onChangeTitle = () => {};

const props = {
  updateMatchExecute,
  formData,
  isTitle,
  onChange,
  onChangeTitle,
};

describe('Rendering', () => {
  it('レンダリングテスト', () => {
    render(<MatchSetForm {...props} />);

    const selectElement = document.getElementById('matchPlaceCountry');
    expect(selectElement).toBeInTheDocument();

    const button = screen.getByText('登録');
    expect(button).toBeInTheDocument();

    // expect(options).toHaveLength(Object.values(COUNTRY).length);
  });
});
