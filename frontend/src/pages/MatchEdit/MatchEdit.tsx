import React, { useEffect } from "react";
import { Axios } from "@/libs/axios";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";
import { queryKeys } from "@/libs/queryKeys";

//! types
import { FighterType } from "@/libs/hooks/useFighter";
import { MatchesType } from "@/libs/hooks/useMatches";
//! component
import { MatchComponent } from "@/components/module/MatchComponent";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
import { EditActionBtns } from "@/components/module/EditActionBtns";
import { PendingModal } from "@/components/modal/PendingModal";
import { SpinnerModal } from "@/components/modal/SpinnerModal";

//! hooks
import { useQueryState } from "@/libs/hooks/useQueryState";
import { useMessageController } from "@/libs/hooks/messageController";
// import { useMatches } from "@/libs/hooks/fetchers";
import { useFetchMatches, useDeleteMatch, useUpdateMatch } from "@/libs/hooks/useMatches";

//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

export const MatchEdit = () => {
  // const [deleteMatchId, setDeleteMatchId] = React.useState<number | undefined>();
  const { state: deleteMatchState, setter: setDeleteMatchState } = useQueryState<MatchesType | undefined>(
    queryKeys.deleteMatchSub
  );
  const { data: matchesData } = useFetchMatches();
  const { deleteMatch, isLoading: isDeletingMatch } = useDeleteMatch();
  const { updateMatch, isLoading: isUpdateingMatch, isSuccess: isUpdatedMatch } = useUpdateMatch();

  const { setMessageToModal } = useMessageController();

  const matchDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    setMessageToModal(MESSAGE.NULL, ModalBgColorType.NULL);
    e.preventDefault();
    if (deleteMatchState === undefined) {
      setMessageToModal(MESSAGE.NO_SELECT_DELETE_MATCH, ModalBgColorType.ERROR);
      return;
    }
    deleteMatch(deleteMatchState.id);
    setDeleteMatchState(undefined);
  };

  const [isCheckedId, setIsCheckedId] = React.useState<number | null>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>, match: MatchesType) => {
    if (isCheckedId === Number(e.target.value)) {
      setIsCheckedId(null);
      setDeleteMatchState(undefined);
    } else {
      setIsCheckedId(Number(e.target.value));
      setDeleteMatchState(match);
    }
  };

  useEffect(() => {
    setIsCheckedId(null);
    setDeleteMatchState(undefined);
  }, [isUpdatedMatch]);

  const actionBtns = [{ btnTitle: "試合の削除", form: "match-delete" }];
  return (
    <LayoutForEditPage>
      <EditActionBtns actionBtns={actionBtns} />
      <div className="flex mt-[50px] w-[100vw]">
        <form id={"match-delete"} className="w-2/3" onSubmit={matchDelete}>
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
                  // onChange={() => setDeleteMatchState(match)}
                  onChange={(e) => onChange(e, match)}
                />
                <div className={"flex flex-row-reverse cursor-pointer relative"}>
                  <label className="w-[95%]" htmlFor={`match_${match.id}`}>
                    <MatchComponent match={match} className={""} />
                  </label>
                  {!match.id && <SpinnerModal />}
                  {isUpdateingMatch && deleteMatchState?.id === match.id && <SpinnerModal />}
                </div>
              </div>
            ))}
        </form>
        <div className="w-1/3">
          <MatchEditForm matchUpdate={(deleteData: MatchesType) => updateMatch(deleteData)} />
        </div>
      </div>
      {isDeletingMatch && <PendingModal message="試合データの削除中です..." />}
    </LayoutForEditPage>
  );
};

type DeleteMatchState = {
  matchUpdate: (deleteMatchState: MatchesType) => void;
};

const MatchEditForm = ({ matchUpdate }: DeleteMatchState) => {
  const { setMessageToModal } = useMessageController();
  const { data: matchesData } = useFetchMatches();
  const { state: deleteMatchState, setter: setDeleteMatchState } = useQueryState<MatchesType>(queryKeys.deleteMatchSub);
  const alterMatchDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessageToModal(MESSAGE.NULL, ModalBgColorType.NULL);
    if (!deleteMatchState) {
      setMessageToModal(MESSAGE.MATCH_NOT_SELECTED, ModalBgColorType.NOTICE);
      return;
    }
    const prevDeleteMatchState = matchesData?.find((match) => match.id === deleteMatchState.id);
    if (prevDeleteMatchState?.date === deleteMatchState.date) {
      setMessageToModal(MESSAGE.MATCH_NOT_ALTER, ModalBgColorType.NOTICE);
      return;
    }
    matchUpdate(deleteMatchState);
    // updateMatch(deleteMatchState);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setDeleteMatchState((prev) => {
      return { ...prev, date };
    });
  };
  return (
    <>
      <form className="p-5 bg-stone-200" onSubmit={alterMatchDate}>
        <label htmlFor="match-date">試合日の変更:</label>
        <input id="match-date" type="date" value={(deleteMatchState?.date as string) || ""} onChange={onChange} />
        <button className="bg-green-500 text-white py-1 px-5 rounded float-right">変更</button>
      </form>
    </>
  );
};
