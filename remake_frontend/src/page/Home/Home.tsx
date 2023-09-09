import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
// ! components
import { FightBox } from "@/components/module/FightBox";
import { LinkList } from "@/components/module/LinkList";
// ! hooks
import { useFetchMatches } from "@/hooks/useMatch";
import { usePagePath } from "@/hooks/usePagePath";

export const Home = () => {
  // ! use hook
  const { data: matchesData } = useFetchMatches();
  const { setter: setPagePath } = usePagePath();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const testClick = (matchId: number) => {
    navigate(`/match?match_id=${matchId}`);
  };

  //? ページpathをRecoilに保存
  useEffect(() => {
    setPagePath(pathname);
  }, []);

  return (
    <>
      {/* <Helmet>
        <title>Home</title>
      </Helmet> */}
      <div className="my-10">
        <ul>
          {matchesData &&
            matchesData.map((match) => (
              <li
                key={match.id}
                className="w-full h-full flex justify-center items-center mt-8"
              >
                <FightBox
                  onClick={testClick}
                  matchData={match}
                  className="border-[1px] border-stone-300 rounded-md"
                />
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
