import React, { useState, useEffect, useRef } from 'react';
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

//! components
// import { FightBox } from "@/components/module/FightBox";
import { FlagImage } from '@/components/atomic/FlagImage';
import { SubHeadline } from '@/components/atomic/SubHeadline';
import { MatchSetter } from '@/components/module/MatchSetter/MatchSetter';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
// ! hooks
import { useFetchAllMatches, useDeleteMatch } from '@/hooks/apiHooks/useMatch';
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
import { useSortMatches } from '@/hooks/useSortMatches';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
//! types
import { MatchDataType } from '@/assets/types';
// ! image
import crown from '@/assets/images/etc/champion.svg';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const MatchEdit = () => {
  // ! use hook
  const { state: headerHeight } = useHeaderHeight();
  const { resetLoadingState } = useLoading();
  const { data: matchesData } = useFetchAllMatches();
  const { sortedMatches } = useSortMatches(matchesData);
  const { setToastModal, showToastModal } = useToastModal();
  const { deleteMatch, isSuccess: isSuccessDeleteMatch } = useDeleteMatch();

  const [selectMatch, setSelectMatch] = useState<MatchDataType>();
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  //? 試合の削除に成功したら...
  useEffect(() => {
    if (!isSuccessDeleteMatch) return;
    setSelectMatch(undefined);
  }, [isSuccessDeleteMatch]);

  //?削除ボタンを押した時の挙動(確認モーダルの表示など)
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

  //? 試合の削除を実行
  const deleteExecution = () => {
    if (!selectMatch) return;
    setIsDeleteConfirm(false);
    deleteMatch(selectMatch.id);
  };

  return (
    <>
      <Helmet>
        <title>試合編集 | {siteTitle}</title>
      </Helmet>
      <div className="flex w-full">
        <section
          style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
          className="w-[70%] border-r-[1px] border-stone-200"
        >
          <div className="flex w-full sticky top-[100px]">
            <div className="w-[45%] flex justify-center">
              {selectMatch ? (
                <div className="w-full flex flex-col items-center">
                  <MatchInfo matchData={selectMatch} />
                  <WinnerSelector matchData={selectMatch} />
                </div>
              ) : (
                <div className="w-[80%]">
                  <div className="border-[1px] rounded-md border-stone-400 w-full min-h-[300px] flex justify-center items-center">
                    <p className="text-[26px]">Select Match...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="w-[55%] flex ite justify-center">
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
                  {/* 削除ダイアログ */}
                  {isDeleteConfirm && (
                    <DeleteConfirm
                      execution={deleteExecution}
                      cancel={() => setIsDeleteConfirm(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-[30%] pt-[20px] flex justify-center">
          <MatchListComponent
            sortedMatches={sortedMatches}
            selectMatch={selectMatch}
            setSelectMatch={setSelectMatch}
          />
        </section>
      </div>
    </>
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

export const MatchInfo = ({
  matchData,
}: {
  matchData: MatchDataType | undefined;
}) => {
  const matchResult = useRef<string | null>(null);

  if (!matchData) return <div>選択なし</div>;

  if (matchData.match_result) {
    if (matchData.match_result === 'red')
      matchResult.current = matchData.red_boxer.name;
    if (matchData.match_result === 'blue')
      matchResult.current = matchData.red_boxer.name;
    if (matchData.match_result === 'draw') matchResult.current = '引き分け';
    if (matchData.match_result === 'no-contest')
      matchResult.current = '無効試合';
  }

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
          <SubHeadline content="会場">
            {matchData.venue}
            <span className="lg:w-[32px] lg:h-[24px] w-[24px] h-[18px] border-[1px] overflow-hidden absolute top-[1px] lg:left-[-40px] left-[-30px]">
              <FlagImage
                className="inline-block border-[1px] lg:w-[32px] lg:h-[24px] w-[24px] h-[18px] mr-3"
                nationality={matchData.country}
              />
            </span>
          </SubHeadline>
        </div>

        {/* 階級 */}
        <div className="mt-10 text-center">
          <SubHeadline content="階級">
            {`${matchData.weight.replace('S', 'スーパー')}級`}
          </SubHeadline>
        </div>

        {/* 勝者 */}
        {matchResult.current && (
          <div className="mt-10 text-center">
            <SubHeadline content="勝者">{matchResult.current}</SubHeadline>
          </div>
        )}
      </div>
    </div>
  );
};

type DeleteConfirmPropsType = {
  cancel: () => void;
  execution: () => void;
};
const DeleteConfirm = ({ execution, cancel }: DeleteConfirmPropsType) => {
  return (
    <ConfirmDialog header={'削除してもよろしいですか？'}>
      <div className="flex justify-between">
        <button
          onClick={execution}
          className="bg-red-500 text-white py-1 px-5 rounded-md"
        >
          はい
        </button>
        <button
          onClick={cancel}
          className="bg-stone-500 text-white py-1 px-5 rounded-md"
        >
          キャンセル
        </button>
      </div>
    </ConfirmDialog>
  );
};

const WinnerSelector = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <div className="w-full text-center">
      <h2 className="py-3">勝者選択</h2>
      <ul className="flex">
        <li className="w-[50%]">
          <button className="rounded bg-stone-600 hover:bg-red-700 text-white px-4 py-1 duration-200">
            {matchData.red_boxer.name}
          </button>
        </li>
        <li className="w-[50%]">
          <button className="rounded bg-stone-600 hover:bg-blue-700 text-white px-4 py-1 duration-200">
            {matchData.blue_boxer.name}
          </button>
        </li>
      </ul>
    </div>
  );
};
