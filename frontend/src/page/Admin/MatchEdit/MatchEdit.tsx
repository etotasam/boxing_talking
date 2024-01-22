import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from '@/assets/statusesOnToastModal';
//! func
import { isMatchDatePast } from '@/assets/functions';

//! components
import { MatchInfo } from '@/components/module/MatchInfo';
import { MatchSetter } from '@/components/module/MatchSetter/MatchSetter';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
// ! hooks
import { useFetchAllMatches, useDeleteMatch } from '@/hooks/apiHooks/useMatch';
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
import { useSortMatches } from '@/hooks/useSortMatches';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useUpdateMatch } from '@/hooks/apiHooks/useMatch';
//! types
import { MatchDataType } from '@/assets/types';
// ! image
import { Button } from '@/components/atomic/Button';

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
  const [isShowMatchResultSelectorDialog, setIsShowMatchResultSelectorDialog] =
    useState(false);

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
                  <div className="w-[90%] border-[1px] border-stone-400">
                    <MatchInfo matchData={selectMatch} />
                  </div>
                  <div className="mt-5">
                    <Button
                      onClick={() => setIsShowMatchResultSelectorDialog(true)}
                      bgColor="bg-green-600 hover:bg-green-700"
                    >
                      試合結果登録
                    </Button>
                  </div>
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

      {/* 試合結果のセット Dialog */}
      {isShowMatchResultSelectorDialog && (
        <MatchResultSetDialog
          selectedMatchData={selectMatch}
          setIsShowMatchResultSelectorDialog={
            setIsShowMatchResultSelectorDialog
          }
        />
      )}
      {/* delete dialog */}
      {isDeleteConfirm && (
        <DeleteConfirm
          execution={deleteExecution}
          cancel={() => setIsDeleteConfirm(false)}
        />
      )}
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

const MatchResultSetDialog = ({
  selectedMatchData,
  setIsShowMatchResultSelectorDialog,
}: {
  selectedMatchData: MatchDataType | undefined;
  setIsShowMatchResultSelectorDialog: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}) => {
  const { updateMatch, isSuccess } = useUpdateMatch();
  const matchResultSet = ({
    result,
  }: {
    result: {
      match_result: 'red' | 'blue' | 'draw' | 'no-contest' | null;
    };
  }) => {
    updateMatch({ matchId: selectedMatchData!.id, changeData: result });
  };

  useEffect(() => {
    if (!isSuccess) return;
    setIsShowMatchResultSelectorDialog(false);
  }, [isSuccess]);

  if (!selectedMatchData) return;

  return (
    <ConfirmDialog
      header="試合結果の登録"
      closeButton={true}
      closeDialog={() => setIsShowMatchResultSelectorDialog(false)}
    >
      <div className="w-full text-center">
        <div className="flex">
          <button
            onClick={() => matchResultSet({ result: { match_result: 'red' } })}
            className="rounded bg-red-600 hover:bg-red-500 text-white px-4 py-1 mr-3 duration-200"
          >
            {selectedMatchData.red_boxer.name}
          </button>

          <button
            onClick={() => matchResultSet({ result: { match_result: 'blue' } })}
            className="rounded bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 mr-3 duration-200"
          >
            {selectedMatchData.blue_boxer.name}
          </button>

          <button
            onClick={() => matchResultSet({ result: { match_result: 'draw' } })}
            className="rounded bg-sky-500 hover:bg-sky-300 text-white px-4 py-1 mr-3 duration-200"
          >
            引き分け
          </button>

          <button
            onClick={() =>
              matchResultSet({ result: { match_result: 'no-contest' } })
            }
            className="rounded bg-black hover:bg-stone-600 text-white px-4 py-1 mr-3 duration-200"
          >
            無効試合
          </button>

          <button
            onClick={() => matchResultSet({ result: { match_result: null } })}
            className="rounded bg-black hover:bg-stone-600 text-white px-4 py-1 mr-3 duration-200"
          >
            削除
          </button>
        </div>
      </div>
    </ConfirmDialog>
  );
};
