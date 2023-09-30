import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from '@/assets/statusesOnToastModal';
//! func
import { isMatchDatePast } from '@/assets/functions';
//! layout
import AdminLayout from '@/layout/AdminLayout';
//! components
// import { FightBox } from "@/components/module/FightBox";
import { FlagImage } from '@/components/atomic/FlagImage';
import { MatchSetter } from '@/components/module/MatchSetter/MatchSetter';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { Confirm } from '@/components/modal/Confirm';
// ! hooks
import { useFetchMatches, useDeleteMatch } from '@/hooks/useMatch';
import { useToastModal } from '@/hooks/useToastModal';
import { usePagePath } from '@/hooks/usePagePath';
import { useLoading } from '@/hooks/useLoading';
import { useSortMatches } from '@/hooks/useSortMatches';
//! types
import { MatchDataType } from '@/assets/types';
// ! image
import crown from '@/assets/images/etc/champion.svg';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const MatchEdit = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();
  const { pathname } = useLocation();
  const { data: matchesData } = useFetchMatches();
  const { sortedMatches } = useSortMatches(matchesData);
  const { setToastModal, showToastModal } = useToastModal();
  const { deleteMatch, isSuccess: isSuccessDeleteMatch } = useDeleteMatch();
  const { setter: setPagePath } = usePagePath();

  const [selectMatch, setSelectMatch] = useState<MatchDataType>();
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  //? 試合の削除に成功した時…
  useEffect(() => {
    if (!isSuccessDeleteMatch) return;
    setSelectMatch(undefined);
  }, [isSuccessDeleteMatch]);

  const handleClickDeleteButton = () => {
    if (!selectMatch) {
      setToastModal({
        message: MESSAGE.MATCH_IS_NOT_SELECTED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }
    setIsDeleteConfirm(true);
  };

  const deleteExecution = () => {
    if (!selectMatch) return;
    setIsDeleteConfirm(false);
    deleteMatch(selectMatch.id);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>試合編集 | {siteTitle}</title>
      </Helmet>
      <div className="mt-[120px] flex w-full">
        <section className="w-[30%] flex justify-center">
          {selectMatch ? (
            <SelectedMatchInfo matchData={selectMatch} />
          ) : (
            <div className="w-[80%]">
              <div className="border-[1px] rounded-md border-stone-400 w-full min-h-[300px] flex justify-center items-center">
                <p className="text-[26px]">Select Match...</p>
              </div>
            </div>
          )}
        </section>

        <section className="w-[40%] flex ite justify-center">
          <div className="w-[80%]">
            <MatchSetter
              selectMatch={selectMatch}
              isSuccessDeleteMatch={isSuccessDeleteMatch}
            />
            <div className="mt-5">
              <button
                onClick={handleClickDeleteButton}
                className="py-2 w-[150px] bg-red-700 text-white rounded-sm"
              >
                削除
              </button>
              {isDeleteConfirm && (
                <Confirm
                  execution={deleteExecution}
                  cancel={() => setIsDeleteConfirm(false)}
                >
                  削除しますか？
                </Confirm>
              )}
            </div>
          </div>
        </section>

        <section className="w-[30%] flex justify-center">
          <MatchListComponent
            sortedMatches={sortedMatches}
            selectMatch={selectMatch}
            setSelectMatch={setSelectMatch}
          />
        </section>
      </div>
    </AdminLayout>
  );
};

type MatchComponentType = {
  sortedMatches: MatchDataType[] | undefined;
  selectMatch: MatchDataType | undefined;
  setSelectMatch: React.Dispatch<
    React.SetStateAction<MatchDataType | undefined>
  >;
};

export const MatchListComponent = ({
  sortedMatches,
  selectMatch,
  setSelectMatch,
}: MatchComponentType) => {
  return (
    <>
      <ul className="w-[95%]">
        {sortedMatches &&
          sortedMatches.map((match) => (
            <li
              key={match.id}
              onClick={() => setSelectMatch(match)}
              className={clsx(
                'text-center border-[1px] border-stone-400 p-3 mb-5 w-full cursor-pointer hover:bg-yellow-50',
                match.id === selectMatch?.id
                  ? `bg-yellow-100 hover:bg-yellow-100`
                  : isMatchDatePast(match) && 'bg-stone-100'
              )}
            >
              <h2 className="text-[18px]">
                {dayjs(match.match_date).format('YYYY年M月D日')}
              </h2>
              <div className="flex mt-3">
                <div className="flex-1">
                  {/* //? 国旗 */}
                  <div className="flex justify-center">
                    <EngNameWithFlag
                      boxerCountry={match.red_boxer.country}
                      boxerEngName={match.red_boxer.eng_name}
                    />
                  </div>
                  {/* //? 名前 */}
                  <p className="">{match.red_boxer.name}</p>
                </div>

                <div className="flex-1">
                  {/* //? 国旗 */}
                  <div className="flex justify-center">
                    <EngNameWithFlag
                      boxerCountry={match.blue_boxer.country}
                      boxerEngName={match.blue_boxer.eng_name}
                    />
                  </div>
                  {/* //? 名前 */}
                  <p className="">{match.blue_boxer.name}</p>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
};

export const SelectedMatchInfo = ({
  matchData,
}: {
  matchData: MatchDataType | undefined;
}) => {
  if (!matchData) return <div>選択なし</div>;
  return (
    <div className="w-[80%]">
      {/* 日時 */}
      <div className="p-5 text-stone-600 border-[1px] rounded-sm border-stone-300 w-full">
        <div className="text-center relative mt-5">
          <h2 className="lg:text-2xl text-lg after:content-['(日本時間)'] after:absolute after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] after:text-sm">
            {dayjs(matchData.match_date).format('YYYY年M月D日')}
          </h2>
          {matchData.titles.length > 0 && (
            <span className="absolute top-[-32px] left-[50%] translate-x-[-50%] w-[32px] h-[32px] mr-2">
              <img src={crown} alt="" />
            </span>
          )}
        </div>

        {/* グレード */}
        <div className="text-center text-xl mt-5">
          {matchData.grade === 'タイトルマッチ' ? (
            <ul className="flex flex-col">
              {matchData.titles
                .sort()
                .map(({ organization, weightDivision }, index) => (
                  <li key={index} className="mt-1">
                    <div className="relative inline-block lg:text-[18px] text-[16px]">
                      <span className="absolute top-[4px] right-[-28px] w-[18px] h-[18px] mr-2">
                        <img src={crown} alt="" />
                      </span>
                      {organization}世界{weightDivision}級
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="lg:text-[30px] text-[24px] lg:mt-10 mt-5">
              {matchData.grade}
            </p>
          )}
        </div>

        {/* 会場 */}
        <div className="mt-[35px] text-center">
          <div className="relative inline-block lg:text-lg text-sm before:content-['会場'] before:w-full before:absolute before:top-[-25px] before:left-[50%] before:translate-x-[-50%] before:text-[14px] before:text-stone-500">
            {matchData.venue}
            <span className="lg:w-[32px] lg:h-[24px] w-[24px] h-[18px] border-[1px] overflow-hidden absolute top-[1px] lg:left-[-40px] left-[-30px]">
              <FlagImage nationality={matchData.country} />
            </span>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="relative inline-block lg:text-lg text-sm before:content-['階級'] before:w-full before:absolute before:top-[-25px] before:min-w-[100px] before:left-[50%] before:translate-x-[-50%] before:text-[14px] before:text-stone-500">
            {`${matchData.weight.replace('S', 'スーパー')}級`}
          </p>
        </div>
      </div>
    </div>
  );
};
