import React, { useEffect, useState } from 'react';
import { cloneDeep, reduce } from 'lodash';
import dayjs from 'dayjs';
import _ from 'lodash';
// ! types
import {
  NationalityType,
  GRADE_Type,
  WEIGHT_CLASS_Type,
  ORGANIZATIONS_Type,
  MatchDataType,
  MessageType,
} from '@/assets/types';
//!type evolution
import { isMessageType } from '@/assets/typeEvaluations';
//! data
import { WEIGHT_CLASS, ORGANIZATIONS, GRADE } from '@/assets/boxerData';
//? update可能なmatchデータのプロパティ
// import { needMatchPropertyForUpdate } from '@/assets/needMatchPropertyForUpdate';
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from '@/assets/statusesOnToastModal';
import { Nationality } from '@/assets/NationalFlagData';
//! hook
import { useToastModal } from '@/hooks/useToastModal';
import { useUpdateMatch } from '@/hooks/useMatch';

export const MatchSetter = ({
  selectMatch,
  isSuccessDeleteMatch,
}: {
  selectMatch: MatchDataType | undefined;
  isSuccessDeleteMatch?: boolean;
}) => {
  //? use hook
  const { hideToastModal, showToastModalMessage } = useToastModal();
  const { updateMatch } = useUpdateMatch();
  const [matchDate, setMatchDate] = useState('');
  const [matchGrade, setMatchGrade] = useState<GRADE_Type>();
  const [matchPlaceCountry, setMatchPlaceCountry] = useState<
    NationalityType | ''
  >();
  const [matchVenue, setMatchVenue] = useState('');
  const [matchWeight, setMatchWeight] = useState<WEIGHT_CLASS_Type | ''>();
  const [belt, setBelt] = useState<ORGANIZATIONS_Type[] | []>([]);
  const [title, setTitle] = useState(false);
  const [counter, setCounter] = useState(1);

  //? 試合の削除が成功した時…
  useEffect(() => {
    if (!isSuccessDeleteMatch) return;
    setMatchDate('');
    setMatchGrade('');
    setMatchPlaceCountry('');
    setMatchVenue('');
    setMatchWeight('');
    setBelt([]);
  }, [isSuccessDeleteMatch]);

  //? 試合データを選択(props selectMatch)した時に各値を表示出来る様にフォーマットしてセットする
  useEffect(() => {
    if (!selectMatch) return;
    setMatchDate(selectMatch.match_date);
    setMatchGrade(selectMatch.grade);
    setMatchPlaceCountry(selectMatch.country);
    setMatchVenue(selectMatch.venue);
    setMatchWeight(selectMatch.weight);
    setTitle(false);
    if (selectMatch.titles.length) {
      setTitle(true);
      const organizations = selectMatch.titles
        .map((title) => {
          return title.organization;
        })
        .filter((v) => v !== undefined) as ORGANIZATIONS_Type[] | [];
      setBelt(organizations);
    }
  }, [selectMatch]);

  // ? アンマウント時にはトーストモーダルを隠す
  useEffect(() => {
    return () => {
      hideToastModal();
    };
  }, []);
  // ? gradeがタイトルマッチ以外の時は belt (WBA WBCとか...)を空にする
  useEffect(() => {
    if (!title) return setBelt([]);
  }, [title]);

  // ? WBA WBC WBO IBFを選ぶ<select>の数を管理
  useEffect(() => {
    if (belt.length >= 4) {
      setCounter(4);
      return;
    }
    if (!belt.length) {
      setCounter(1);
    } else {
      setCounter(belt.length + 1);
    }
  }, [belt]);

  //?試合のグレードがタイトルマッチ以外の時はorganization(WBA,WBCとか…)を選べない様にする
  useEffect(() => {
    if (matchGrade === GRADE.TITLE_MATCH) {
      setTitle(true);
    } else {
      setTitle(false);
    }
  }, [matchGrade]);

  //? 試合が選択されていない場合モーダル表示
  const showModalIfNotSelectMatch = () => {
    if (!selectMatch) {
      throw new Error(MESSAGE.MATCH_IS_NOT_SELECTED);
    }
  };
  // ? 他、未入力がある場合はモーダルでNOTICE
  const showModalIfUndefinedFieldsExist = () => {
    if (
      !matchDate ||
      !matchGrade ||
      !matchPlaceCountry ||
      !matchVenue ||
      !matchWeight
    ) {
      throw new Error(MESSAGE.MATCH_HAS_NOT_ENTRIES);
    } else if (matchGrade === GRADE.TITLE_MATCH && !belt.length) {
      throw new Error(MESSAGE.MATCH_HAS_NOT_ENTRIES);
    }
  };

  //?更新するのに必要なデータだけを抽出
  const pickMatchDataForUpdate = () => {
    const needMatchPropertyForUpdate = [
      'country',
      'grade',
      'venue',
      'weight',
      'titles',
      'match_date',
    ] as const;
    const pickData = _.pick(
      selectMatch,
      needMatchPropertyForUpdate
    ) as Partial<MatchDataType>;
    return pickData;
  };

  //? 現在のmatchデータと変更データを比較して、変更があるプロパティだけを抽出
  const extractChangeData = (
    matchDataForUpdate: any
  ): Partial<MatchDataType> => {
    //データをセット
    const modificationData = {
      country: matchPlaceCountry,
      grade: matchGrade,
      match_date: matchDate,
      venue: matchVenue,
      weight: matchWeight,
      titles: belt,
    };

    const updateMatchData = _.omitBy(modificationData, (value, key): any => {
      if (Array.isArray(value)) {
        const titles = matchDataForUpdate[key].map(
          ({
            organization,
          }: {
            organization: ORGANIZATIONS_Type;
            weightDivision: WEIGHT_CLASS_Type;
          }) => {
            return organization;
          }
        );
        return _.isEqual(value, titles);
      } else {
        return matchDataForUpdate[key] === value;
      }
    });
    return updateMatchData;
  };

  //?データ変更が無い時モーダル表示
  const showModalIfDataNotChanged = (onlyModifiedData: any) => {
    if (!Object.keys(onlyModifiedData).length) {
      throw new Error(MESSAGE.MATCH_IS_NOT_MODIFIED);
    }
  };

  //? Submit
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      showModalIfNotSelectMatch();
      showModalIfUndefinedFieldsExist();

      const matchDataForUpdate = pickMatchDataForUpdate();

      //? 現在のmatchデータと変更データを比較して、変更があるプロパティだけを抽出
      const onlyModifiedData = extractChangeData(matchDataForUpdate);

      showModalIfDataNotChanged(onlyModifiedData);

      const matchId = selectMatch!.id;

      updateMatch({ matchId, changeData: onlyModifiedData });
    } catch (error: any) {
      if (isMessageType(error.message)) {
        showToastModalMessage({
          message: error.message,
          bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
        });
      } else {
        console.error('Has error when match update', error);
      }
    }
  };

  // ! DOM
  return (
    // <div className="bg-stone-200 flex justify-center items-center py-5 mt-5">
    <div>
      <form
        className="w-[400px] bg-stone-200 border-[1px] border-stone-400 p-5"
        onSubmit={onSubmit}
      >
        <h2 className="text-center my-5 text-[26px] tracking-[0.1em]">
          試合情報
        </h2>
        {/* //? Match Date */}
        <div className="flex">
          {/* <div className="w-[100px] text-right"> */}
          <label className="w-[130px] text-right mr-3" htmlFor="match-date">
            試合日
          </label>
          {/* </div> */}
          <input
            className="w-[150px] p-1"
            id="match-date"
            type="date"
            min={dayjs().format('YYYY-MM-DD')}
            value={matchDate || dayjs().format('YYYY-MM-DD')}
            onChange={(e) => {
              setMatchDate(e.target.value);
            }}
          />
        </div>

        {/* //? Match Grade */}
        <div className="flex mt-5">
          <label className="w-[130px] text-right mr-3" htmlFor="matchGrade">
            Match Grade:
          </label>
          <select
            className="w-[150px]"
            name="matchGrade"
            value={matchGrade}
            onChange={(e) => {
              setMatchGrade(e.target.value as GRADE_Type);
            }}
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

        {title && (
          <ul className="ml-[140px]">
            {/* //? タイトル */}
            {[...Array(counter)].map((_, i) => (
              <li className="mt-1" key={i}>
                <select
                  className="w-[150px]"
                  name="matchBelt"
                  value={belt[i] ? belt[i] : ''}
                  onChange={(e) => {
                    setBelt((current) => {
                      const cloneCurrent = cloneDeep(current);
                      cloneCurrent[i] = e.target.value as ORGANIZATIONS_Type;
                      return cloneCurrent.filter((v) => !!v);
                    });
                  }}
                  id="matchBelt"
                >
                  <option value={undefined}></option>
                  {Object.values(ORGANIZATIONS).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}

        {/* //? Weight */}
        <div className="flex mt-5">
          <label className="w-[130px] text-right mr-3" htmlFor="matchWeight">
            契約ウエイト:
          </label>
          <select
            className="w-[150px]"
            name="matchWeight"
            value={matchWeight}
            onChange={(e) => {
              setMatchWeight(e.target.value as WEIGHT_CLASS_Type);
            }}
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

        {/* //? Match Place */}
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
            value={matchPlaceCountry}
            onChange={(e) => {
              setMatchPlaceCountry(e.target.value as NationalityType);
            }}
            id="matchPlaceCountry"
          >
            <option value={undefined}></option>
            {Object.values(Nationality).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        {/* //? 会場 */}
        <div className="flex mt-2 ml-[140px]">
          <input
            className="w-full px-1 border-black"
            type="text"
            placeholder="試合会場入力"
            name="matchCountry"
            value={matchVenue}
            onChange={(e) => setMatchVenue(e.target.value)}
          />
        </div>

        <div className="w-full flex justify-center">
          <button className="bg-stone-600 tracking-[0.5em] text-white py-2 px-5 rounded mt-10 w-full">
            登録
          </button>
        </div>
      </form>
    </div>
  );
};
