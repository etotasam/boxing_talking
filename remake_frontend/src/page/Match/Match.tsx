import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
//! types
import { MatchesDataType } from "@/assets/types";
// ! hook
import { useFetchMatches } from "@/hooks/useMatch";
import { usePagePath } from "@/hooks/usePagePath";
//! component
import { EngNameWithFlag } from "@/components/atomc/EngNameWithFlag";

export const Match = () => {
  const { pathname, search } = useLocation();
  const { data: matches } = useFetchMatches();
  const query = new URLSearchParams(search);
  const paramsMatchID = Number(query.get("match_id"));

  const [selectedMatch, setSelectedMatch] = useState<MatchesDataType>();
  useEffect(() => {
    if (!matches) return;
    const match = matches?.find((match) => match.id === paramsMatchID);
    setSelectedMatch(match);
  }, [paramsMatchID]);
  // ! use hook
  const { setter: setPagePath } = usePagePath();

  //? ページpathをRecoilに保存
  useEffect(() => {
    setPagePath(pathname);
  }, []);

  return (
    <>
      {/* <div>Match</div> */}
      {selectedMatch && (
        <section className="flex border-b-[1px]">
          <div className="flex-1 py-5">
            <div className="flex flex-col justify-center items-center">
              <EngNameWithFlag
                boxerCountry={selectedMatch.red_boxer.country}
                boxerEngName={selectedMatch.red_boxer.eng_name}
              />
              <h2 className="text-[20px]">{selectedMatch.red_boxer.name}</h2>
            </div>
          </div>
          <div className="flex-1 py-5">
            <div className="flex flex-col justify-center items-center">
              <EngNameWithFlag
                boxerCountry={selectedMatch.blue_boxer.country}
                boxerEngName={selectedMatch.blue_boxer.eng_name}
              />
              <h2 className="text-[20px]">{selectedMatch.blue_boxer.name}</h2>
            </div>
          </div>
        </section>
      )}

      <section className="fixed bottom-0 w-full flex justify-center py-8 border-t-[1px] border-stone-200">
        <div className="w-[70%] max-w-[800px]">
          <PostCommentTextarea />
        </div>
      </section>
    </>
  );
};

const PostCommentTextarea = () => {
  const textareaRef = useRef(null);

  const autoExpandTextarea = () => {
    const textarea = textareaRef.current as unknown as HTMLTextAreaElement;
    if (!textarea) return;
    if (textarea.scrollHeight > 250) return;
    textarea.style.height = "auto"; // 高さを一時的にautoに設定
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="border-stone-400 relative border-[1px] pl-3 py-2 rounded-sm flex justify-center items-center">
      <textarea
        ref={textareaRef}
        className="w-full resize-none outline-0 leading-[28px] pr-[100px]"
        placeholder="コメント投稿..."
        wrap={"hard"}
        name=""
        id=""
        rows={1}
        onChange={autoExpandTextarea}
      ></textarea>
      <button className="absolute bottom-[7px] text-[14px] right-[10px] border-[1px] bg-stone-600 py-1 text-white pl-4 pr-3 tracking-[0.4em]">
        送信
      </button>
    </div>
  );
};
