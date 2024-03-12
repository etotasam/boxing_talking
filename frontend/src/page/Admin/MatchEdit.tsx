import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from '@/assets/statusesOnToastModal';
//! func
import { isMatchDatePast } from '@/assets/functions';
//! components
import { MatchInfo } from '@/components/module/MatchInfo';
import { EditMatchForm } from '@/components/module/MatchSetForm/EditMatchForm';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
// ! hooks
import { useFetchPastMatches, useFetchMatches, useDeleteMatch } from '@/hooks/apiHooks/useMatch';
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
import { useSortMatches } from '@/hooks/useSortMatches';
import { useMatchResult } from '@/hooks/apiHooks/useMatch';
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
//! types
import { MatchDataType } from '@/assets/types';
// ! image
import { Button, CustomButton } from '@/components/atomic/Button';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const MatchEdit = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  // ? use hook
  const { resetLoadingState } = useLoading();
  const { data: matchesData } = useFetchMatches();
  const { data: pastMatchesData } = useFetchPastMatches();
  const { beforeMatches, afterMatches } = useSortMatches(matchesData);
  const allMatches = pastMatchesData && [...beforeMatches, ...afterMatches, ...pastMatchesData];
  const { setToastModal, showToastModal } = useToastModal();
  const { deleteMatch, isSuccess: isSuccessDeleteMatch } = useDeleteMatch();

  const [selectedMatch, setSelectMatch] = useState<MatchDataType>();
  const { isDayOnFight, isDayAfterFight } = useDayOfFightChecker(selectedMatch?.matchDate);

  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isShowMatchResultSelectorDialog, setIsShowMatchResultSelectorDialog] = useState(false);

  const isShowMatchResultRegisterButton = !isDayOnFight && isDayAfterFight;

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
    if (!selectedMatch) {
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
    if (!selectedMatch) return;
    setIsDeleteConfirm(false);
    deleteMatch(selectedMatch.id);
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
              {selectedMatch ? (
                <div className="w-full flex flex-col items-center">
                  <div className="w-[90%] border-[1px] pt-10 pb-5 border-stone-400">
                    <MatchInfo matchData={selectedMatch} />
                  </div>

                  {isShowMatchResultRegisterButton && (
                    <div className="mt-5 w-[90%] flex justify-center">
                      <Button styleName="matchResultRegister" onClick={() => setIsShowMatchResultSelectorDialog(true)}>
                        試合結果登録
                      </Button>
                    </div>
                  )}
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
                <EditMatchForm selectedMatch={selectedMatch} isSuccessDeleteMatch={isSuccessDeleteMatch} />
                <div className="mt-5">
                  <Button styleName={'delete'} onClick={handleClickDeleteButton}>
                    削除
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{ maxHeight: `calc(100vh - ${headerHeight}px)` }}
          className="w-[30%] pt-[20px] flex justify-center overflow-auto"
        >
          <MatchListComponent
            sortedMatches={allMatches}
            selectedMatch={selectedMatch}
            setSelectMatch={setSelectMatch}
          />
        </section>
      </div>

      {/* 試合結果のセット Dialog */}
      {isShowMatchResultSelectorDialog && (
        <MatchResultSetDialog
          selectedMatchData={selectedMatch}
          setIsShowMatchResultSelectorDialog={setIsShowMatchResultSelectorDialog}
        />
      )}
      {/* delete dialog */}
      {isDeleteConfirm && <DeleteConfirm execution={deleteExecution} cancel={() => setIsDeleteConfirm(false)} />}
    </>
  );
};

type MatchComponentType = {
  sortedMatches: MatchDataType[] | undefined;
  selectedMatch: MatchDataType | undefined;
  setSelectMatch: React.Dispatch<React.SetStateAction<MatchDataType | undefined>>;
};

export const MatchListComponent = ({ sortedMatches, selectedMatch, setSelectMatch }: MatchComponentType) => {
  return (
    <>
      <ul className="w-[95%] ">
        {sortedMatches &&
          sortedMatches.map((match) => (
            <li
              key={match.id}
              onClick={() => setSelectMatch(match)}
              className={clsx(
                'text-center border-[1px] border-stone-400 p-3 mb-5 w-full cursor-pointer hover:bg-yellow-50',
                match.id === selectedMatch?.id
                  ? `bg-yellow-100 hover:bg-yellow-100`
                  : isMatchDatePast(match) && 'bg-stone-100'
              )}
            >
              <h2 className="text-[18px]">{dayjs(match.matchDate).format('YYYY年M月D日')}</h2>
              <div className="flex mt-3">
                <div className="flex-1">
                  {/* //? 国旗 */}
                  <div className="flex justify-center">
                    <EngNameWithFlag boxerCountry={match.redBoxer.country} boxerEngName={match.redBoxer.engName} />
                  </div>
                  {/* //? 名前 */}
                  <p className="">{match.redBoxer.name}</p>
                </div>

                <div className="flex-1">
                  {/* //? 国旗 */}
                  <div className="flex justify-center">
                    <EngNameWithFlag boxerCountry={match.blueBoxer.country} boxerEngName={match.blueBoxer.engName} />
                  </div>
                  {/* //? 名前 */}
                  <p className="">{match.blueBoxer.name}</p>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
};

//? 削除確認モーダル
type DeleteConfirmPropsType = {
  cancel: () => void;
  execution: () => void;
};
const DeleteConfirm = ({ execution, cancel }: DeleteConfirmPropsType) => {
  return (
    <ConfirmDialog header={'削除してもよろしいですか？'}>
      <div className="flex justify-between">
        <Button onClick={execution}>はい</Button>
        <Button onClick={cancel}>キャンセル</Button>
      </div>
    </ConfirmDialog>
  );
};

//? 試合結果登録モーダル
const MatchResultSetDialog = ({
  selectedMatchData,
  setIsShowMatchResultSelectorDialog,
}: {
  selectedMatchData: MatchDataType | undefined;
  setIsShowMatchResultSelectorDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { storeMatchResult, isSuccess } = useMatchResult();

  useEffect(() => {
    if (!isSuccess) return;
    setIsShowMatchResultSelectorDialog(false);
  }, [isSuccess]);

  const resultObject = {
    result: ['red', 'blue', 'draw', 'no-contest'] as const,
    detail: ['ko', 'tko', 'ud', 'md', 'sd'] as const,
  };

  type ResultType = (typeof resultObject.result)[number] | undefined;
  type DetailType = (typeof resultObject.detail)[number] | undefined;

  const [matchResult, setMatchResult] = useState<ResultType>(undefined);
  const [matchDetail, setMatchDetail] = useState<DetailType>(undefined);
  const [matchRound, setRound] = useState<string>('1');

  const isWinner = matchResult === 'red' || matchResult === 'blue';
  const isKo = isWinner && (matchDetail === 'ko' || matchDetail === 'tko');
  const validFunk = () => {
    if (isWinner) {
      return !!matchDetail;
    }

    return !!matchResult;
  };
  const isValid = validFunk();

  const matchResultName = {
    red: selectedMatchData!.redBoxer.name,
    blue: selectedMatchData!.blueBoxer.name,
    draw: '引き分け',
    'no-contest': '無効試合',
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!matchResult) return;
    const result = matchResult;
    const detail = isWinner ? matchDetail : undefined;
    const round = isKo ? matchRound : undefined;

    const matchResultValue = {
      matchId: selectedMatchData!.id,
      result: result,
      detail: detail,
      round: round,
    };
    storeMatchResult(matchResultValue);
  };

  if (!selectedMatchData) return;

  return (
    <ConfirmDialog
      header="試合結果の登録"
      closeButton={true}
      closeDialog={() => setIsShowMatchResultSelectorDialog(false)}
    >
      <form onSubmit={submit}>
        <div className="">
          {resultObject.result.map((result) => (
            <label
              key={result}
              className={clsx('border-[1px] border-stone-500 rounded cursor-pointer px-2 py-1 ml-2 first:ml-0')}
            >
              <input
                type="radio"
                value={result}
                checked={matchResult === result}
                onChange={(e) => setMatchResult(e.target.value as ResultType)}
              />
              <span className="ml-2">{matchResultName[result]}</span>
            </label>
          ))}
        </div>

        {isWinner && (
          <div className="mt-5">
            {resultObject.detail.map((detail) => (
              <label
                key={detail}
                className={clsx('border-[1px] border-stone-500 rounded cursor-pointer px-2 py-1 ml-2 first:ml-0')}
              >
                <input
                  type="radio"
                  value={detail}
                  checked={matchDetail === detail}
                  onChange={(e) => setMatchDetail(e.target.value as DetailType)}
                />
                <span className="ml-2">{detail.toUpperCase()}</span>
              </label>
            ))}
          </div>
        )}

        {isKo && (
          <div className="mt-5">
            <label className="border-[1px] border-stone-500 rounded px-2 py-1">
              ラウンド:
              <select name="round" defaultValue={matchRound} onChange={(e) => setRound(e.target.value)}>
                {[...Array(12)].map((_, index) => (
                  <option key={index} className="text-right" value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="w-full flex justify-center mt-[30px]">
          <CustomButton
            disabled={!isValid}
            className={clsx(
              'w-full py-2',
              isValid ? 'text-white bg-green-700 hover:bg-green-600 duration-200' : 'text-white/50 bg-stone-600'
            )}
          >
            登録
          </CustomButton>
        </div>
      </form>
    </ConfirmDialog>
  );
};
