import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// ! components
import { FightBox } from "@/components/module/FightBox";
import { SimpleFightBox } from "@/components/module/SimpleFightBox";
// ! hooks
import { useFetchMatches } from "@/hooks/useMatch";
import { usePagePath } from "@/hooks/usePagePath";
import { useLoading } from "@/hooks/useLoading";
import { useGetDevice } from "@/hooks/useGetDevice";

export const Home = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();
  const { data: matchesData } = useFetchMatches();
  const { setter: setPagePath } = usePagePath();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { device } = useGetDevice();

  const testClick = (matchId: number) => {
    navigate(`/match?match_id=${matchId}`);
  };
  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  return (
    <>
      <div className="md:my-10 mb-5">
        <ul>
          {matchesData &&
            matchesData.map((match) => (
              <li
                key={match.id}
                className="w-full h-full flex justify-center items-center lg:mt-8 md:mt-5"
              >
                {device === "PC" ? (
                  <FightBox onClick={testClick} matchData={match} />
                ) : (
                  <SimpleFightBox
                    onClick={testClick}
                    matchData={match}
                    // className="border-[1px] border-stone-300 rounded-md"
                  />
                )}
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
