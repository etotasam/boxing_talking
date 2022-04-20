// module
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

// types
import { FighterType } from "@/libs/types/fighter";

// components
import { LayoutDefault } from "@/layout/LayoutDefault";
import { CommentDeleteModal } from "@/components/modal/CommentDeleteModal";
import { PostCommentForm } from "@/components/module/PostCommentForm";
import { MatchInfo } from "@/components/module/MatchInfo";
import { CommentsContainer } from "@/components/module/CommentsContainer";

//api
import { MatchesType } from "@/libs/apis/fetchMatchesAPI";

// custom hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useMessageController } from "@/libs/hooks/messageController";
import { MESSAGE } from "@/libs/utils";
import { useLogout } from "@/libs/hooks/useLogout";
import { usePostComment } from "@/libs/hooks/usePostComment";
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { useResizeCommentsComponent } from "@/libs/hooks/useResizeCommentsComponent";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchVoteResult } from "@/libs/hooks/useFetchVoteResult";
import { useFetchThisMatchComments } from "@/libs/hooks/useFetchThisMatchComments";

export const Match = () => {
  const { deleteCommentsState } = useCommentDelete();
  const { authState } = useAuth();

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  // ユーザー情報
  const { user: authUser } = authState;

  // 試合情報
  const { matchesState } = useFetchAllMatches();
  // const { voteResultState } = useFetchVoteResult();
  const [thisMatch, setThisMatch] = useState<MatchesType>();
  const getThisMatch = (matches: MatchesType[], matchIdByPrams: number): MatchesType | undefined => {
    return matches?.find((match) => match.id === matchIdByPrams);
  };

  useEffect(() => {
    if (!matchesState.matches) return;
    const match = getThisMatch(matchesState.matches, matchId);
    setThisMatch(match);
  }, [matchesState.matches]);

  // data全般

  // Commets Componentの高さを決めるコード(cssの変数を操作)
  const [elRefArray, setElRefArray] = useState<React.RefObject<HTMLDivElement>[]>([]);
  const [elsArray, setElsArray] = useState<(HTMLDivElement | null)[]>([]);

  // refからelementを取得
  useEffect(() => {
    const result = elRefArray.reduce((acc: (HTMLDivElement | null)[], curr) => {
      return [...acc, curr.current];
    }, []);
    setElsArray(result);
  }, [elRefArray]);

  useResizeCommentsComponent(...elsArray);

  return (
    <LayoutDefault>
      <div className="grid grid-cols-2">
        <div className="col-span-1">
          <MatchInfo getElRefArray={(arr: any[]) => setElRefArray((v) => [...v, ...arr])} />
          {thisMatch && (
            <PostCommentForm getPostComRef={(el: any) => setElRefArray((v) => [...v, el])} matchId={thisMatch.id} />
          )}
        </div>
        <div className={`col-span-1 p-5 t-comment-height`}>
          <CommentsContainer />
        </div>
        {deleteCommentsState.confirmModalVisble && <CommentDeleteModal userId={authUser.id} />}
      </div>
    </LayoutDefault>
  );
};
