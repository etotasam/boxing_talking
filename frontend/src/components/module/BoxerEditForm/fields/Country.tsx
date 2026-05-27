import { COUNTRY } from '@/constants/country';

import { CountryType } from '@/types';
import { LocalDataEntryType } from '@/page/Admin/BoxerEdit';

export const Country = (props: {
  boxersCountry: string;
  setBoxerFieldData: LocalDataEntryType;
}) => {
  const { boxersCountry, setBoxerFieldData } = props;
  return (
    <div className="flex mt-3">
      <label className="w-[100px] text-center" htmlFor="country">
        国籍
      </label>
      <select
        className="w-[150px]"
        name="country"
        value={boxersCountry}
        onChange={(e) => {
          setBoxerFieldData('country', e.target.value as CountryType);
        }}
        id="country"
      >
        {/* <option value={undefined}>{countryUndefined}</option> */}
        {Object.values(COUNTRY)
          .sort()
          .map((nationalName) => (
            <option key={nationalName} value={nationalName}>
              {nationalName}
            </option>
          ))}
      </select>
    </div>
  );
};
