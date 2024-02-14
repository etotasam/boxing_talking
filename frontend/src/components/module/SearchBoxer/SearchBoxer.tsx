import React from 'react';
import { NATIONALITY } from '@/assets/NationalFlagData';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/atomic/Button';

export const SearchBoxer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const searchName = React.useRef('');
  const country = React.useRef('');

  const searchExecution = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (country.current && searchName.current) {
      navigate(
        `${pathname}?name=${searchName.current}&country=${country.current}`
      );
      return;
    } else if (country.current) {
      navigate(`${pathname}?country=${country.current}`);
      return;
    } else if (searchName.current) {
      navigate(`${pathname}?name=${searchName.current}`);
      return;
    }
    navigate(pathname);
  };
  return (
    <form
      onSubmit={searchExecution}
      className="bg-stone-200 border-stone-400 border-[1px] p-5"
    >
      <h2 className="text-center text-[26px] tracking-[0.2em]">選手検索</h2>
      <div className="flex mt-3">
        <label className="w-[50px] text-center" htmlFor="country">
          国籍
        </label>
        <select
          className="w-[150px] ml-5"
          name="country"
          // value={boxerDataOnForm?.country}
          onChange={(e) => {
            country.current = e.target.value;
          }}
          id="country"
        >
          <option value={undefined}></option>
          {Object.values(NATIONALITY)
            .sort()
            .map((nationalName) => (
              <option key={nationalName} value={nationalName}>
                {nationalName}
              </option>
            ))}
        </select>
      </div>

      <input
        className="w-full my-5"
        type="text"
        placeholder="名前検索"
        onChange={(e) => {
          searchName.current = e.target.value;
        }}
      />
      <Button styleName="onForm">検索</Button>
    </form>
  );
};
