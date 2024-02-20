import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
// ! types
import {
  CountryType,
  GradeType,
  WeightClassType,
  OrganizationsType,
  MatchUpdateFormType,
} from '@/assets/types';
//! data
import { WEIGHT_CLASS, ORGANIZATIONS, GRADE } from '@/assets/boxerData';
import { COUNTRY } from '@/assets/NationalFlagData';
//! component
import { Button } from '@/components/atomic/Button';

type PropsType = {
  updateMatchExecute: (e: React.FormEvent<HTMLFormElement>) => void;
  formData: MatchUpdateFormType;
  isTitle: boolean;
  onChange: <T>(value: Record<string, T>) => void;
  onChangeTitle: (title: OrganizationsType, index: number) => void;
};

export const MatchSetForm = (props: PropsType) => {
  const { updateMatchExecute, formData, isTitle, onChange, onChangeTitle } =
    props;
  // ! DOM
  return (
    <div>
      <form
        className="w-[400px] bg-stone-200 border-[1px] border-stone-400 p-5"
        onSubmit={updateMatchExecute}
      >
        <h2 className="text-center my-5 text-[26px] tracking-[0.1em]">
          試合情報
        </h2>
        {/* //? Match Date */}
        <DateSection date={formData.match_date} onChange={onChange} />

        <GradeSection grade={formData.grade} onChange={onChange} />

        {isTitle && (
          <TitlesSection
            titles={formData.titles}
            onChangeTitle={onChangeTitle}
          />
        )}

        <WeightSection weight={formData.weight} onChange={onChange} />

        <PlaceSection
          onChange={onChange}
          country={formData.country}
          venue={formData.venue}
        />

        <div className="w-full flex justify-center mt-5">
          <Button styleName="wide">登録</Button>
        </div>
      </form>
    </div>
  );
};

type DateSectionType = {
  date: string;
  onChange: (value: { match_date: string }) => void;
};
const DateSection = (props: DateSectionType) => {
  const { date, onChange } = props;
  return (
    <div className="flex">
      <label className="w-[130px] text-right mr-3" htmlFor="match-date">
        試合日
      </label>
      <input
        className="w-[150px] p-1"
        id="match-date"
        type="date"
        min={dayjs().format('YYYY-MM-DD')}
        value={date || dayjs().format('YYYY-MM-DD')}
        onChange={(e) => onChange({ match_date: e.target.value })}
      />
    </div>
  );
};

type GradeSectionType = {
  grade: GradeType | undefined;
  onChange: (value: { grade: GradeType }) => void;
};
const GradeSection = (props: GradeSectionType) => {
  const { grade, onChange } = props;
  return (
    <div className="flex mt-5">
      <label className="w-[130px] text-right mr-3" htmlFor="matchGrade">
        Match Grade:
      </label>
      <select
        className="w-[150px]"
        name="matchGrade"
        value={grade}
        onChange={(e) => onChange({ grade: e.target.value as GradeType })}
        id="matchGrade"
      >
        <option value={undefined}></option>
        {Object.values(GRADE).map((grade) => (
          <option key={grade} value={grade}>
            {grade}
          </option>
        ))}
      </select>
    </div>
  );
};

const TitlesSection = React.memo(
  ({
    titles,
    onChangeTitle,
  }: {
    titles: OrganizationsType[];
    onChangeTitle: (value: OrganizationsType, index: number) => void;
  }) => {
    const [counter, setCounter] = useState(1);

    // ? WBA WBC WBO IBFを選ぶ<select>の数を管理
    useEffect(() => {
      const matchTitles = titles;
      if (matchTitles.length >= 4) {
        setCounter(4);
        return;
      }
      if (!matchTitles.length) {
        setCounter(1);
      } else {
        setCounter(matchTitles.length + 1);
      }
    }, [titles]);

    //? 表示するselect
    const organizationNames = Object.values(ORGANIZATIONS).filter((orgName) => {
      const trimOrgName = orgName.slice(0, 3);
      const timeTitles = titles.map((title) => {
        return title.slice(0, 3);
      });
      return !timeTitles.includes(trimOrgName);
    });

    return (
      <ul className="ml-[140px]">
        {/* //? タイトル */}
        {[...Array(counter)].map((_, i) => (
          <li className="mt-1" key={i}>
            <select
              className="w-[150px]"
              name="matchBelt"
              value={titles[i] ?? ''}
              onChange={(e) =>
                onChangeTitle(e.target.value as OrganizationsType, i)
              }
              id="matchBelt"
            >
              <option value={undefined}></option>

              {titles[i] && <option value={titles[i]}>{titles[i]}</option>}
              {titles[i] === ORGANIZATIONS.WBC_INTERIM && (
                <option value={ORGANIZATIONS.WBC}>{ORGANIZATIONS.WBC}</option>
              )}
              {titles[i] === ORGANIZATIONS.WBC && (
                <option value={ORGANIZATIONS.WBC_INTERIM}>
                  {ORGANIZATIONS.WBC_INTERIM}
                </option>
              )}

              {titles[i] === ORGANIZATIONS.WBO_INTERIM && (
                <option value={ORGANIZATIONS.WBO}>{ORGANIZATIONS.WBO}</option>
              )}
              {titles[i] === ORGANIZATIONS.WBO && (
                <option value={ORGANIZATIONS.WBO_INTERIM}>
                  {ORGANIZATIONS.WBO_INTERIM}
                </option>
              )}
              {organizationNames.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    );
  }
);

type PlaceSectionType = {
  country: CountryType | undefined;
  venue: string | undefined;
  onChange: <T>(value: Record<string, T>) => void;
};
const PlaceSection = (props: PlaceSectionType) => {
  const { country, onChange, venue } = props;
  return (
    <>
      <div className="flex mt-5">
        <label
          className="w-[130px] text-right mr-3"
          htmlFor="matchPlaceCountry"
        >
          会場:
        </label>
        {/* //? 国旗用 国の選択 */}
        <select
          className="w-[150px]"
          name="matchPlaceCountry"
          value={country}
          onChange={(e) =>
            onChange({
              country: e.target.value as CountryType,
            })
          }
          id="matchPlaceCountry"
        >
          <option value={undefined}></option>
          {Object.values(COUNTRY).map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className="flex mt-2 ml-[140px]">
        <input
          className="w-full px-1 border-black"
          type="text"
          placeholder="試合会場入力"
          name="matchCountry"
          value={venue}
          onChange={(e) => onChange({ venue: e.target.value })}
        />
      </div>
    </>
  );
};

type WeightSectionType = {
  weight: WeightClassType | undefined;
  onChange: (value: { weight: WeightClassType }) => void;
};
const WeightSection = (props: WeightSectionType) => {
  const { weight, onChange } = props;
  return (
    <div className="flex mt-5">
      <label className="w-[130px] text-right mr-3" htmlFor="matchWeight">
        契約ウエイト:
      </label>
      <select
        className="w-[150px]"
        name="matchWeight"
        value={weight}
        onChange={(e) =>
          onChange({
            weight: e.target.value as WeightClassType,
          })
        }
        id="matchWeight"
      >
        <option value={undefined}></option>
        {Object.values(WEIGHT_CLASS).map((weight) => (
          <option key={weight} value={weight}>
            {weight}
          </option>
        ))}
      </select>
    </div>
  );
};
