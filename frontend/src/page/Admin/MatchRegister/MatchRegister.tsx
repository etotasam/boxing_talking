import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { Helmet } from 'react-helmet-async';
// ! types
import {
  CountryType,
  RegisterMatchPropsType,
  GradeType,
  WeightClassType,
  OrganizationsType,
} from '@/assets/types';
// ! data
import { COUNTRY } from '@/assets/NationalFlagData';
import { WEIGHT_CLASS, ORGANIZATIONS, GRADE } from '@/assets/boxerData';
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from '@/assets/statusesOnToastModal';
// ! hooks
import { useFetchBoxers } from '@/hooks/apiHooks/useBoxer';
import { BoxerType } from '@/assets/types';
import { useRegisterMatch } from '@/hooks/apiHooks/useMatch';
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! component
import { SearchBoxer } from '@/components/module/SearchBoxer';
import { PaginationBoxerList } from '@/components/module/PaginationBoxerList';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { Button } from '@/components/atomic/Button';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const MatchRegister = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  //! use hook
  const { boxersData, pageCount } = useFetchBoxers();
  const [matchBoxers, setMatchBoxers] = useState<MatchBoxersType>({
    red_boxer: undefined,
    blue_boxer: undefined,
  });
  const { resetLoadingState } = useLoading();

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>試合登録 | {siteTitle}</title>
      </Helmet>
      <div
        className="w-full flex"
        style={{ minHeight: `calc( 100vh - ${headerHeight}px)` }}
      >
        <section className="w-[70%] border-r-[1px] border-stone-200">
          <div className="sticky top-[80px]">
            <MatchSetUpBox boxers={matchBoxers} />
            <div className="flex mt-5">
              <div className="w-[50%] flex justify-center">
                <MatchDataSetter
                  matchBoxers={matchBoxers}
                  setMatchBoxers={setMatchBoxers}
                />
              </div>
              <div className="w-[50%] flex justify-center">
                <div className="w-[90%]">
                  <SearchBoxer />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-[30%] min-w-[300px] pb-5">
          <PaginationBoxerList pageCount={pageCount} />
          <BoxersList
            boxersData={boxersData}
            matchBoxers={matchBoxers}
            setMatchBoxers={setMatchBoxers}
          />
        </section>
      </div>
    </>
  );
};

// ! 対戦相手
const MatchSetUpBox = ({ boxers }: { boxers: MatchBoxersType }) => {
  return (
    <div className="flex items-center h-[150px] bg-gray-50">
      <div className="flex justify-between w-full">
        <div className="flex-1 flex justify-center">
          {boxers.red_boxer && <BoxerBox boxerData={boxers.red_boxer} />}
        </div>

        <div className="flex-1 flex justify-center">
          {boxers.blue_boxer && <BoxerBox boxerData={boxers.blue_boxer} />}
        </div>
      </div>
    </div>
  );
};

// ! 選手
const BoxerBox = ({ boxerData }: { boxerData: BoxerType }) => {
  return (
    <>
      <div className="w-[300px] mt-3 border-[1px] border-stone-300 rounded-md p-3">
        <div className="text-center">
          <EngNameWithFlag
            boxerCountry={boxerData.country}
            boxerEngName={boxerData.eng_name}
          />
          <h2 className="relative inline-block">{boxerData.name}</h2>
        </div>
      </div>
    </>
  );
};

// ! 選手リスト
type BoxerListType = {
  boxersData: BoxerType[] | undefined;
  matchBoxers: MatchBoxersType;
  setMatchBoxers: React.Dispatch<React.SetStateAction<MatchBoxersType>>;
};
type MatchBoxersType = {
  red_boxer: BoxerType | undefined;
  blue_boxer: BoxerType | undefined;
};
const BoxersList = ({
  boxersData,
  matchBoxers,
  setMatchBoxers,
}: BoxerListType) => {
  const isChecked = (id: number) => {
    return Object.values(matchBoxers).some((boxer) => boxer && boxer.id === id);
  };

  // ? ボクサーを選択出来るかどうかの判断（チェックボックスの状態を確認）
  const canCheck = (id: number) => {
    //? red,blueのどちらか一方でも選択されていなければチェックをつける事ができる
    if (Object.values(matchBoxers).some((boxer) => boxer === undefined))
      return false;
    //? 選択している選手はチェックをはずす事ができる
    if (Object.values(matchBoxers).some((boxer) => boxer && boxer.id === id)) {
      return false;
    }
    return true;
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    boxer: BoxerType
  ) => {
    if (e.target.checked) {
      //? redが空いていれば入れる
      if (matchBoxers.red_boxer === undefined) {
        setMatchBoxers((current: MatchBoxersType) => {
          return { ...current, red_boxer: boxer };
        });
        return;
      }
      //? blueが空いていれば入れる
      if (matchBoxers.blue_boxer === undefined) {
        setMatchBoxers((current: MatchBoxersType) => {
          return { ...current, blue_boxer: boxer };
        });
        return;
      }
      return;
    }

    //? checked状態のobjectをクリックした時はチェックを外す
    const selectedBoxerState = (
      Object.keys(matchBoxers) as Array<keyof MatchBoxersType>
    ).reduce((acc, key) => {
      if (matchBoxers[key]?.id === boxer.id) {
        return { ...acc, [key]: undefined };
      }
      return { ...acc };
    }, matchBoxers);
    setMatchBoxers(selectedBoxerState);
  };

  return (
    <>
      {boxersData && (
        <ul className="flex justify-center flex-col items-center">
          {boxersData.map((boxer) => (
            <div className="relative" key={boxer.eng_name}>
              <input
                className="absolute top-[50%] left-5 translate-y-[-50%] cursor-pointer"
                id={`${boxer.id}_${boxer.name}`}
                type="checkbox"
                name="boxer"
                value={boxer.id}
                checked={isChecked(boxer.id)}
                disabled={canCheck(boxer.id)}
                onChange={(e) => handleCheckboxChange(e, boxer)}
              />
              <label
                className={'w-[90%] cursor-pointer'}
                htmlFor={`${boxer.id}_${boxer.name}`}
              >
                <li className="w-[300px] mt-3 border-[1px] border-stone-300 rounded-md p-3">
                  <div className="text-center">
                    <EngNameWithFlag
                      boxerCountry={boxer.country}
                      boxerEngName={boxer.eng_name}
                    />
                    <h2 className="text-lg mt-2">{boxer.name}</h2>
                  </div>
                </li>
              </label>
            </div>
          ))}
        </ul>
      )}
    </>
  );
};

// ! 試合情報セッター
type MatchDataSetterPropsType = {
  matchBoxers: MatchBoxersType;
  setMatchBoxers: React.Dispatch<React.SetStateAction<MatchBoxersType>>;
};

// ! 試合データ入力
const MatchDataSetter = ({
  matchBoxers,
  setMatchBoxers,
}: MatchDataSetterPropsType) => {
  //? use hook
  const { showToastModal, setToastModal, hideToastModal } = useToastModal();
  const { registerMatch, isSuccess: isSuccessRegisterMatch } =
    useRegisterMatch();
  // const matchDate = useRef("");
  const [matchDate, setMatchDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [matchGrade, setMatchGrade] = useState<GradeType | ''>('');
  const [matchPlaceCountry, setMatchPlaceCountry] = useState<
    CountryType | ''
  >();
  const [matchVenue, setMatchVenue] = useState<string>('');
  const [matchWeight, setMatchWeight] = useState<WeightClassType | ''>();
  const [belt, setBelt] = useState<OrganizationsType[]>([]);
  const [title, setTitle] = useState(false);
  const [counter, setCounter] = useState(1);

  useEffect(() => {
    if (!isSuccessRegisterMatch) return;
    setMatchDate(dayjs().format('YYYY-MM-DD'));
    setMatchGrade('');
    setMatchPlaceCountry('');
    setMatchVenue('');
    setMatchWeight('');
    setBelt([]);
    setTitle(false);
    setCounter(1);

    setMatchBoxers({ red_boxer: undefined, blue_boxer: undefined });
  }, [isSuccessRegisterMatch]);

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
    if (belt.length > 3) return;
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

  //? 試合登録
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ? 選手を選択していない場合モーダルでNOTICE
    if (Object.values(matchBoxers).includes(undefined)) {
      setToastModal({
        message: MESSAGE.MATCH_NOT_SELECTED_BOXER,
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
      return;
    }

    // let formattedBelt;
    // if (belt.length) {
    //   formattedBelt = belt.map((title) => {
    //     return `${title}世界${matchWeight}級`;
    //   });
    // } else {
    //   formattedBelt = cloneDeep(belt);
    // }

    const matchData: RegisterMatchPropsType = {
      red_boxer_id: matchBoxers.red_boxer!.id!,
      blue_boxer_id: matchBoxers.blue_boxer!.id!,
      match_date: matchDate,
      grade: matchGrade!,
      country: matchPlaceCountry,
      venue: matchVenue,
      weight: matchWeight!,
      titles: belt,
    };
    registerMatch(matchData);
  };

  return (
    // <div className="bg-stone-200 flex justify-center items-center py-5 mt-5">
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
          value={matchDate}
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
            setMatchGrade(e.target.value as GradeType);
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
          {Array.from({ length: counter }, (_, index) => index).map((_, i) => (
            <li className="mt-1" key={i}>
              <select
                className="w-[150px]"
                name="matchBelt"
                value={belt[i]}
                onChange={(e) => {
                  setBelt((current) => {
                    const clone = cloneDeep(current);
                    clone[i] = e.target.value as OrganizationsType;
                    return clone;
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
            setMatchWeight(e.target.value as WeightClassType);
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
            setMatchPlaceCountry(e.target.value as CountryType);
          }}
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
      {/* //? 会場 */}
      <div className="flex mt-2 ml-[140px]">
        <input
          className="w-full px-1 border border-black"
          type="text"
          placeholder="試合会場入力"
          name="matachCountry"
          value={matchVenue}
          onChange={(e) => setMatchVenue(e.target.value)}
        />
      </div>

      <div className="w-full flex justify-center mt-5">
        <Button styleName="wide">登録</Button>
      </div>
    </form>
    // </div>
  );
};
