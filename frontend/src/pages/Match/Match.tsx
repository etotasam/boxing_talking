import React from "react";
//! module
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

//! components
import { LayoutDefault } from "@/layout/LayoutDefault";
import { PostCommentForm } from "@/components/module/PostCommentForm";
import { MatchInfo } from "@/components/module/MatchInfo";
import { CommentsContainer } from "@/components/module/CommentsContainer";
import { DataFetchErrorComponent } from "@/components/module/DataFetchErrorComponent";

//! api
import { MatchesType } from "@/libs/hooks/useMatches";

//! custom hooks
import { useAuth } from "@/libs/hooks/useAuth";
// import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { useDeleteComment } from "@/libs/hooks/useComment";
import { useAdjustCommentsContainer } from "@/libs/hooks/useAdjustCommentsContainer";
// import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchMatches } from "@/libs/hooks/useMatches";

export const Match = () => {
  const { deleteComment } = useDeleteComment();
  const { data: authUser } = useAuth();

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));
  const navigate = useNavigate();

  //? 試合情報
  const { data: matchesData, isError: isErrorOnFetchMatches } = useFetchMatches();

  //? エラー情報
  const [hasAnyError, setHasAnyError] = useState(false);
  const errors = [isErrorOnFetchMatches];
  useEffect(() => {
    const hasError = errors.includes(true);
    setHasAnyError(hasError);
  }, [...errors]);

  //? 存在しないmatch_idでアクセスされた場合homeへ
  useEffect(() => {
    if (!matchesData) return;
    const hasExistMatch = matchesData.some((match) => match.id === matchId);
    if (!matchId || !hasExistMatch) return navigate("/");
  }, [matchesData]);

  // const { voteResultState } = useFetchVoteResult();
  const [thisMatch, setThisMatch] = useState<MatchesType>();
  const getThisMatch = (
    matches: MatchesType[],
    matchIdByPrams: number
  ): MatchesType | undefined => {
    return matches?.find((match) => match.id === matchIdByPrams);
  };

  useEffect(() => {
    if (!matchesData) return;
    const match = getThisMatch(matchesData, matchId);
    setThisMatch(match);
  }, [matchesData, matchId]);

  //? 下記Refの高さに合わせてCommentsContainerコンポーネントの高さを操作(cssの変数を操作)
  const matchInfoRef = React.useRef<HTMLDivElement>(null);
  const formDivRef = React.useRef<HTMLDivElement>(null);
  //? CommentsContainerコンポーネントのサイズを画面に合わせる為のhook
  useAdjustCommentsContainer([matchInfoRef, formDivRef]);

  if (hasAnyError) {
    return <DataFetchErrorComponent />;
  }

  return (
    <LayoutDefault>
      <div className="grid grid-cols-5">
        <div className="col-span-3">
          <div ref={matchInfoRef}>
            <MatchInfo />
          </div>
          <div ref={formDivRef} className="py-10">
            {thisMatch && <PostCommentForm matchId={thisMatch.id} />}
          </div>
        </div>
        <div className={`relative col-span-2 pr-5 t-comment-height`}>
          <CommentsContainer />
        </div>
        {/* {deleteCommentsState.confirmModalVisble && <CommentDeleteModal userId={authUser!.id} />} */}
      </div>
    </LayoutDefault>
  );
};
