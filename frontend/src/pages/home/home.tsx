import React, { useCallback } from "react";
import { Axios } from "@/libs/axios";
import { useNavigate } from "react-router-dom";
import { AuthIs } from "@/store/slice/authUserSlice";
import { MESSAGE } from "@/libs/utils";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";

//! hooks
// import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";
// import { useAuth } from "@/libs/hooks/useAuth";
import { useMessageController } from "@/libs/hooks/messageController";

//! components
import { LayoutDefault } from "@/layout/LayoutDefault";
import { MatchComponent } from "@/components/module/MatchComponent";

export const Home = React.memo(() => {
  const navigate = useNavigate();
  const { data: authUser } = useAuth();
  // const {
  //   authState: { hasAuth, user: authUser },
  // } = useAuth();

  // const { matchesState } = useFetchAllMatches();
  const { data: matchesState } = useFetchMatches();

  const queue = useCallback(async () => {
    if (!authUser) return;
    const { data } = await Axios.put(`api/${authUser.id}/test`);
    console.log(data);
  }, [authUser]);

  const { setMessageToModal } = useMessageController();
  const click = (id: number) => {
    if (!authUser) {
      setMessageToModal(MESSAGE.NOT_AUTHORIZED, ModalBgColorType.ERROR);
      return;
    }
    navigate(`/match?id=${id}`);
  };

  return (
    <LayoutDefault>
      <div className={`w-2/3 my-5 ml-5 rounded-md pb-3 bg-stone-50`}>
        <h1 className="rounded-t-md bg-stone-800 text-white text-2xl p-2">SCHEDULE</h1>
        {matchesState !== undefined &&
          matchesState.map((match) => (
            <MatchComponent
              key={match.id}
              onClick={(matchId: number) => click(matchId)}
              match={match}
            />
          ))}
      </div>
    </LayoutDefault>
  );
});
