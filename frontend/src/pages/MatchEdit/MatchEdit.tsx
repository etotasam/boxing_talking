import React from "react";
import axios from "@/libs/axios";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";

// component
import { MatchComponent } from "@/components/module/MatchComponent";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
import { EditActionBtns } from "@/components/module/EditActionBtns";

// hooks
import { useMessageController } from "@/libs/hooks/messageController";
import { useMatches } from "@/libs/hooks/fetchers";

// layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

export const MatchEdit = () => {
  const [deleteMatchId, setDeleteMatchId] = React.useState<number>();
  const { data: matchesData, mutate: matchesMutate } = useMatches();

  const { setMessageToModal } = useMessageController();

  const [pending, setPending] = React.useState(false);
  const matchDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (deleteMatchId === undefined) {
      setMessageToModal(MESSAGE.NO_SELECT_DELETE_MATCH, ModalBgColorType.ERROR);
      return;
    }
    //? 対象を削除した試合データの取得
    const matchesDataWithoutDeleteMatch = matchesData?.filter(
      (match) => match.id !== deleteMatchId
    );
    setPending(true);
    try {
      const { data } = await axios.delete("api/match/delete", { data: { matchId: deleteMatchId } });
      console.log(data);
      matchesMutate(matchesDataWithoutDeleteMatch);
    } catch (error) {
      console.log(error);
    }
    setPending(false);
  };

  const actionBtns = [{ btnTitle: "試合の削除", form: "match-delete" }];
  return (
    <LayoutForEditPage>
      <EditActionBtns actionBtns={actionBtns} />
      <div className="flex mt-[50px]">
        <form id={"match-delete"} className="w-2/3" onSubmit={matchDelete}>
          {matchesData &&
            matchesData.map((match) => (
              <div key={match.id} className={`relative bg-stone-200 m-2`}>
                <input
                  className="absolute top-[50%] left-5 translate-y-[-50%]"
                  id={`match_${match.id}`}
                  type="radio"
                  name="match"
                  value={match.id}
                  onChange={(e) => setDeleteMatchId(Number(e.target.value))}
                />
                <div className={"flex flex-row-reverse cursor-pointer"}>
                  <label className="w-[95%]" htmlFor={`match_${match.id}`}>
                    <MatchComponent match={match} className={""} />
                  </label>
                </div>
              </div>
            ))}
        </form>
        <div className="w-1/3 bg-blue-300">テスト</div>
      </div>
      {pending && <FullScreenSpinnerModal />}
    </LayoutForEditPage>
  );
};
