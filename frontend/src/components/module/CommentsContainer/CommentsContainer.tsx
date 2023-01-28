//! component
import { CommentComponent } from "@/components/module/CommentComponent";
import { Spinner } from "@/components/module/Spinner";
import { useLocation } from "react-router-dom";
//!hooks
import { useFetchCommentsOnMatch } from "@/libs/hooks/useComment";

export const CommentsContainer = () => {
  //? urlからmatchIdを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get("id"));

  //? この試合へのコメントを取得
  const { data: commentsData } = useFetchCommentsOnMatch(matchId);

  //? コメント欄をloadingにする条件
  if (!commentsData) return <Spinner />;
  return (
    <>
      {commentsData.length ? (
        <ul
          className={`z-0 relative h-full min-h-[50px] md:overflow-y-auto px-4 md:px-5 lg:pr-0 lg:pl-10`}
        >
          {commentsData.map((comment) => (
            <li key={comment.id} className="last:pb-3 first:pt-3 mb-4 last:mb-0 ">
              <CommentComponent commentData={comment} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center">コメントはありません</div>
      )}
    </>
  );
};
