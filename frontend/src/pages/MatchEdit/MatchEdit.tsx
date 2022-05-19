import React, { useEffect } from "react";
import { queryKeys } from "@/libs/queryKeys";
import { NationaFlag, checkNationality } from "@/components/module/Fighter";
//! types
import { MatchesType } from "@/libs/hooks/useMatches";
//! component
import { MatchComponent } from "@/components/module/MatchComponent";
import { EditActionBtns } from "@/components/module/EditActionBtns";
import { PendingModal } from "@/components/modal/PendingModal";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { Spinner } from "@/components/module/Spinner";
//! hooks
import { useQueryState } from "@/libs/hooks/useQueryState";
import { useFetchMatches, useDeleteMatch, useUpdateMatch } from "@/libs/hooks/useMatches";
//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

export const MatchEdit = () => {
  // const [deleteMatchId, setDeleteMatchId] = React.useState<number | undefined>();
  const { state: targetMatchState, setter: setTargetMatchState } = useQueryState<
    MatchesType | undefined
  >(queryKeys.deleteMatchSub);
  const { data: matchesData } = useFetchMatches();
  const { deleteMatch, isLoading: isDeletingMatch, isSuccess: isDeleteComplete } = useDeleteMatch();
  const { updateMatch, isLoading: isUpdateingMatch, isSuccess: isUpdatedMatch } = useUpdateMatch();

  const { setToastModalMessage, clearToastModaleMessage } = useToastModal();

  //todo
  const [isOpenConfirmModal, setIsOpenConfirmModal] = React.useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearToastModaleMessage();
    if (!isCheckedId) {
      setToastModalMessage({
        message: MESSAGE.MATCH_NOT_SELECTED,
        bgColor: ModalBgColorType.NOTICE,
      });
      return;
    }
    setIsOpenConfirmModal(true);
  };

  //? 試合の削除
  const matchDelete = () => {
    if (!targetMatchState) {
      console.error("targetMatchState is not set");
      return;
    }
    setIsOpenConfirmModal(false);
    deleteMatch(targetMatchState.id);
  };

  //? 試合の削除が成功したら
  useEffect(() => {
    setTargetMatchState(undefined);
  }, [isDeleteComplete]);

  //? 試合を選択しているかどうか
  const [isCheckedId, setIsCheckedId] = React.useState<number | null>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>, match: MatchesType) => {
    if (isCheckedId === Number(e.target.value)) {
      setIsCheckedId(null);
      setTargetMatchState(undefined);
    } else {
      setIsCheckedId(Number(e.target.value));
      setTargetMatchState(match);
    }
  };

  //? 更新が成功した時のエフェクト
  useEffect(() => {
    if (!isUpdatedMatch) return;
    setIsCheckedId(null);
    setTargetMatchState(undefined);
  }, [isUpdatedMatch]);

  const actionBtns = [{ btnTitle: "試合の削除", form: "match-delete" }];
  return (
    <LayoutForEditPage>
      <EditActionBtns actionBtns={actionBtns} />
      <div className="flex mt-[50px] w-full">
        <form id={"match-delete"} className="w-2/3" onSubmit={submit}>
          {matchesData &&
            matchesData.map((match) => (
              <div key={match.id} className={`relative bg-stone-200 m-2`}>
                <input
                  className="absolute top-[50%] left-5 translate-y-[-50%]"
                  id={`match_${match.id}`}
                  type="checkbox"
                  name="match"
                  value={match.id}
                  checked={isCheckedId === match.id}
                  // onChange={() => setTargetMatchState(match)}
                  onChange={(e) => onChange(e, match)}
                />
                <div className={"flex flex-row-reverse cursor-pointer relative"}>
                  <label className="w-[95%]" htmlFor={`match_${match.id}`}>
                    <MatchComponent match={match} className={""} />
                  </label>
                  {!match.id && <Spinner />}
                  {isUpdateingMatch && targetMatchState?.id === match.id && <Spinner />}
                </div>
              </div>
            ))}
        </form>
        <div className={`w-1/3`}>
          <div className="sticky top-[100px] right-0 pt-2">
            <MatchEditForm matchUpdate={(updateData: MatchesType) => updateMatch(updateData)} />
          </div>
        </div>
      </div>
      {isDeletingMatch && <PendingModal message="試合データの削除中です..." />}
      {isOpenConfirmModal && (
        <ConfirmModal
          message={<Message MatchesData={targetMatchState} />}
          okBtnString={"削除"}
          execution={matchDelete}
          cancel={() => setIsOpenConfirmModal(false)}
        />
      )}
    </LayoutForEditPage>
  );
};

type MatchEditFormPropsType = {
  matchUpdate: (deleteMatchState: MatchesType) => void;
};

const MatchEditForm = ({ matchUpdate }: MatchEditFormPropsType) => {
  const { setToastModalMessage, clearToastModaleMessage } = useToastModal();
  const { data: matchesData } = useFetchMatches();
  const { state: targetMatchState, setter: setTargetMatchState } = useQueryState<MatchesType>(
    queryKeys.deleteMatchSub
  );
  const alterMatchDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearToastModaleMessage();
    if (!targetMatchState) {
      setToastModalMessage({
        message: MESSAGE.MATCH_NOT_SELECTED,
        bgColor: ModalBgColorType.NOTICE,
      });
      return;
    }
    //? 編集対象に変更がない場合はトーストでお知らせ
    const prevDeleteMatchState = matchesData?.find((match) => match.id === targetMatchState.id);
    if (prevDeleteMatchState?.date === targetMatchState.date) {
      setToastModalMessage({ message: MESSAGE.MATCH_NOT_ALTER, bgColor: ModalBgColorType.NOTICE });
      return;
    }
    matchUpdate(targetMatchState);
    // updateMatch(deleteMatchState);
  };

  //? 試合日を指定(編集)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setTargetMatchState((prev) => {
      return { ...prev, date };
    });
  };

  return (
    <>
      <form className="p-5 bg-stone-200" onSubmit={alterMatchDate}>
        <label htmlFor="match-date">試合日の変更:</label>
        <input
          id="match-date"
          type="date"
          value={(targetMatchState?.date as string) || ""}
          onChange={onChange}
        />
        <button className="bg-green-500 text-white py-1 px-5 rounded float-right">変更</button>
      </form>
    </>
  );
};

const Message = ({ MatchesData }: { MatchesData: MatchesType | undefined }) => {
  const [redFlag, setRedFlag] = React.useState<NationaFlag | undefined>();
  const [blueFlag, setBlueFlag] = React.useState<NationaFlag | undefined>();
  useEffect(() => {
    if (!MatchesData) return;
    setRedFlag(checkNationality(MatchesData.red.country!));
    setBlueFlag(checkNationality(MatchesData.blue.country!));
  }, [MatchesData]);
  return (
    <div>
      {MatchesData && (
        <div className="flex justify-center w-full">
          <div className="flex justify-center">
            <div className={`${redFlag} t-flag w-[25px] h-[25px] mr-2`} />
            <p>{MatchesData.red.name}</p>
          </div>
          <span className="mx-5">VS</span>
          <div className="flex justify-center">
            <p>{MatchesData.blue.name}</p>
            <div className={`${blueFlag} t-flag w-[25px] h-[25px] ml-2`} />
          </div>
        </div>
      )}
    </div>
  );
};
