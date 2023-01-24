import React, { useRef } from "react";
import { WINDOW_WIDTH } from "@/libs/utils";
//! module
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
//! components
import { PostCommentForm } from "@/components/module/PostCommentForm";
import { MatchInfo } from "@/components/module/MatchInfo";
import { CommentsContainer } from "@/components/module/CommentsContainer";
//! api
import { MatchesType } from "@/libs/hooks/useMatches";
//! custom hooks
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
import { useAdjustCommentsContainer } from "@/libs/hooks/useAdjustCommentsContainer";
import { useFetchMatches } from "@/libs/hooks/useMatches";

export const Match = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));
  const navigate = useNavigate();

  //? 試合情報
  const { data: matchesData, isError: isErrorOnFetchMatches } = useFetchMatches();

  //? エラー情報
  const [, setHasAnyError] = useState(false);
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

  //? matches配列の中からurlパラメータから受け取ったidで試合を特定
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

  //? 1.コメント投稿時にコメントcontainerのtopにスクロールさせる位置の取得の為のref(matchInfoRef)
  //? 2.commentContainerの高さがcommentFormの高さの変化に対応する為のhook、その為のref
  const matchInfoRef = useRef<HTMLDivElement>(null);
  const commentFormRef = useRef<HTMLDivElement>(null);
  const commentContainerHeight = useAdjustCommentsContainer([matchInfoRef, commentFormRef]);
  const { width: windowWidth } = useGetWindowSize();

  return (
    <>
      <div className="lg:grid lg:grid-cols-[1fr_1fr]">
        <div ref={matchInfoRef} className="lg:col-span-1">
          <MatchInfo />
        </div>

        <div
          ref={commentFormRef}
          className="z-20 lg:col-span-1 sticky top-0 py-5 flex items-center bg-stone-200"
        >
          {thisMatch && <PostCommentForm matchId={thisMatch.id} matchInfoRef={matchInfoRef} />}
        </div>

        {thisMatch && (
          <div
            className={`relative lg:row-start-1 lg:row-span-3 lg:col-start-2`}
            style={windowWidth > WINDOW_WIDTH.lg ? { height: `${commentContainerHeight}px` } : {}}
          >
            <CommentsContainer />
          </div>
        )}
      </div>
    </>
  );
};
