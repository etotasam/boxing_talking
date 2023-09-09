import React, { useRef, useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import dayjs from "dayjs";
import _ from "lodash";
// ! types
import {
  NationalityType,
  RegstarMatchPropsType,
  GRADE_Type,
  WEIGHT_CLASS_Type,
  ORGANIZATIONS_Type,
  MatchesDataType,
} from "@/assets/types";
//! data
import { WEIGHT_CLASS, ORGANIZATIONS, GRADE } from "@/assets/boxerData";
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from "@/assets/statusesOnToastModal";
import { Nationality } from "@/assets/NationalFlagData";
//! hook
import { useToastModal } from "@/hooks/useToastModal";
import { useUpdateMatch } from "@/hooks/useMatch";

export const MatchSetter = ({
  selectMatch,
}: {
  selectMatch: MatchesDataType | undefined;
}) => {
  //? use hook
  const { showToastModal, setToastModal, hideToastModal } = useToastModal();
  const { updateMatch } = useUpdateMatch();
  // const { registerMatch } = useRegisterMatch();
  // const matchDate = useRef("");
  const [matchDate, setMatchDate] = useState("");
  const [matchGrade, setMatchGrade] = useState<GRADE_Type>();
  const [matchPlaceCountry, setMatchPlaceCountry] = useState<NationalityType>();
  const [matchVenue, setMatchVenue] = useState("");
  const [matchWeight, setMatchWeight] = useState<WEIGHT_CLASS_Type>();
  const [belt, setBelt] = useState<ORGANIZATIONS_Type[] | []>([]);
  const [title, setTitle] = useState(false);
  const [counter, setCounter] = useState(1);

  //? 試合データを選択(props selectMatch)した時に各値を表示出来る様にフォーマットしてセットする
  useEffect(() => {
    if (!selectMatch) return;
    setMatchDate(selectMatch.match_date);
    setMatchGrade(selectMatch.grade);
    setMatchPlaceCountry(selectMatch.country);
    setMatchVenue(selectMatch.venue);
    setMatchWeight(selectMatch.weight);
    if (selectMatch.titles) {
      const organizations = selectMatch.titles
        .map((value) => {
          for (const organi of Object.values(ORGANIZATIONS)) {
            if (value.includes(organi)) return organi;
          }
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

  useEffect(() => {
    if (matchGrade === GRADE.TITLE_MATCH) {
      setTitle(true);
    } else {
      setTitle(false);
    }
  }, [matchGrade]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectMatch) {
      setToastModal({
        message: MESSAGE.MATCH_IS_NOT_SELECTED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }

    // ? 他、未入力がある場合はモーダルでNOTICE
    if (
      !matchDate ||
      !matchGrade ||
      !matchPlaceCountry ||
      !matchVenue ||
      !matchWeight
    ) {
      setToastModal({
        message: MESSAGE.MATCH_HAS_NOT_ENTRIES,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    } else if (matchGrade === GRADE.TITLE_MATCH && !belt.length) {
      setToastModal({
        message: MESSAGE.MATCH_HAS_NOT_ENTRIES,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
    }

    // ? 保持タイトルをデータベース保存様にフォーマット
    let formattedBelt;
    if (belt.length) {
      formattedBelt = belt.map((title) => {
        return `${title}世界${matchWeight!}級`;
      });
    } else {
      formattedBelt = cloneDeep(belt);
    }

    //? selectMatchから必要なプロパティだけ抽出
    const matchProperty = [
      "country",
      "grade",
      "venue",
      "weight",
      "titles",
      "match_date",
    ];
    const pickSelectMatchData = _.pick(selectMatch, matchProperty) as any;

    // ? 入力値
    const modificationData = {
      country: matchPlaceCountry,
      grade: matchGrade,
      match_date: matchDate,
      venue: matchVenue,
      weight: matchWeight,
      titles: formattedBelt,
    };

    //? 現在のmatchデータと変更データを比較して、変更があるプロパティだけを抽出
    const updateMatchData = _.omitBy(modificationData, (value, key) => {
      if (Array.isArray(value)) {
        return _.isEqual(value, pickSelectMatchData[key]);
      } else {
        return pickSelectMatchData[key] === value;
      }
    });

    if (!Object.keys(updateMatchData).length) {
      setToastModal({
        message: MESSAGE.MATCH_IS_NOT_MODIFIED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }

    const matchId = selectMatch.id;
    console.log(updateMatchData);

    updateMatch({ matchId, updateMatchData });
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
            min={dayjs().format("YYYY-MM-DD")}
            value={matchDate || dayjs().format("YYYY-MM-DD")}
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
            {Array.from({ length: counter }, (_, index) => index).map(
              (key, i) => (
                <li className="mt-1" key={i}>
                  <select
                    className="w-[150px]"
                    name="matchBelt"
                    value={belt[i]}
                    onChange={(e) => {
                      setBelt((current) => {
                        const clone = cloneDeep(current);
                        clone[i] = e.target.value as ORGANIZATIONS_Type;
                        return clone;
                      });
                    }}
                    id="matchBelt"
                  >
                    <option value={undefined}></option>
                    {Object.values(ORGANIZATIONS).map((v, index) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </li>
              )
            )}
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
            className="w-full px-1 bourder border-black"
            type="text"
            placeholder="試合会場入力"
            name="matachCountry"
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
