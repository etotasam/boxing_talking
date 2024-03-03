import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
// ! hooks
import { useFetchBoxers } from '@/hooks/apiHooks/useBoxer';
import { BoxerType } from '@/assets/types';
import { useLoading } from '@/hooks/useLoading';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! component
import { SearchBoxer } from '@/components/module/SearchBoxer';
import { PaginationBoxerList } from '@/components/module/PaginationBoxerList';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
// import { RegisterMatchForm } from '@/components/module/MatchSetForm';
import { RegisterMatchForm } from '@/components/module/MatchSetForm/RegisterMatchForm';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const MatchRegister = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  //! use hook
  const { boxersData, pageCount } = useFetchBoxers();

  const initialMatchBoxers = {
    red_boxer: undefined,
    blue_boxer: undefined,
  };
  const [matchBoxers, setMatchBoxers] = useState<MatchBoxersType>(initialMatchBoxers);
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
      <div className="w-full flex" style={{ minHeight: `calc( 100vh - ${headerHeight}px)` }}>
        <section className="w-[70%] border-r-[1px] border-stone-200">
          <div className="sticky top-[80px]">
            <MatchSetUpBox boxers={matchBoxers} />
            <div className="flex mt-5">
              <div className="w-[50%] flex justify-center">
                <RegisterMatchForm
                  boxers={{
                    redBoxerId: matchBoxers.red_boxer?.id,
                    blueBoxerId: matchBoxers.blue_boxer?.id,
                  }}
                  resetSelectedBoxers={() => setMatchBoxers(initialMatchBoxers)}
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
        <section
          style={{ maxHeight: `calc( 100vh - ${headerHeight}px)` }}
          className="relative w-[30%] min-w-[300px] pb-5 overflow-auto"
        >
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
          <EngNameWithFlag boxerCountry={boxerData.country} boxerEngName={boxerData.engName} />
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
const BoxersList = ({ boxersData, matchBoxers, setMatchBoxers }: BoxerListType) => {
  const isChecked = (id: number) => {
    return Object.values(matchBoxers).some((boxer) => boxer && boxer.id === id);
  };

  // ? ボクサーを選択出来るかどうかの判断（チェックボックスの状態を確認）
  const canCheck = (id: number) => {
    //? red,blueのどちらか一方でも選択されていなければチェックをつける事ができる
    if (Object.values(matchBoxers).some((boxer) => boxer === undefined)) return false;
    //? 選択している選手はチェックをはずす事ができる
    if (Object.values(matchBoxers).some((boxer) => boxer && boxer.id === id)) {
      return false;
    }
    return true;
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, boxer: BoxerType) => {
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
    const selectedBoxerState = (Object.keys(matchBoxers) as Array<keyof MatchBoxersType>).reduce(
      (acc, key) => {
        if (matchBoxers[key]?.id === boxer.id) {
          return { ...acc, [key]: undefined };
        }
        return { ...acc };
      },
      matchBoxers
    );
    setMatchBoxers(selectedBoxerState);
  };

  return (
    <>
      {boxersData && (
        <ul className="flex justify-center flex-col items-center">
          {boxersData.map((boxer, i) => (
            <div className="relative" key={`${boxer.engName}_${i}`}>
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
              <label className={'w-[90%] cursor-pointer'} htmlFor={`${boxer.id}_${boxer.name}`}>
                <li className="w-[300px] mt-3 border-[1px] border-stone-300 rounded-md p-3">
                  <div className="text-center">
                    <EngNameWithFlag boxerCountry={boxer.country} boxerEngName={boxer.engName} />
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
