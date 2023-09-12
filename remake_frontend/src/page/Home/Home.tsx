import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// ! components
import { FightBox } from '@/components/module/FightBox';
import { SimpleFightBox } from '@/components/module/SimpleFightBox';
import { Footer } from '@/components/module/Footer';
// ! hooks
import { useFetchMatches } from '@/hooks/useMatch';
import { usePagePath } from '@/hooks/usePagePath';
import { useLoading } from '@/hooks/useLoading';
import { useWindowSize } from '@/hooks/useWindowSize';
//! types
import { MatchesDataType } from '@/assets/types';

export const Home = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();
  const { data: matchesData } = useFetchMatches();
  const { setter: setPagePath } = usePagePath();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { windowSize } = useWindowSize();

  const matchSelect = (matchId: number) => {
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

  const [isSimple, setIsSimple] = useState(false);

  return (
    <>
      <div className="md:my-10 mb-5">
        {windowSize === 'PC' && (
          <button onClick={() => setIsSimple((curr) => !curr)}>
            {isSimple ? `詳細モードへ` : `シンプルモードへ`}
          </button>
        )}
        <ul>
          {matchesData &&
            matchesData.map((match) => (
              <li
                key={match.id}
                className="w-full h-full flex justify-center items-center lg:mt-8 md:mt-5"
              >
                <MatchesView
                  isSimple={isSimple}
                  match={match}
                  matchSelect={matchSelect}
                />
              </li>
            ))}
        </ul>
      </div>

      <Footer />
    </>
  );
};

type MatchesViewPropsType = {
  match: MatchesDataType;
  matchSelect: (matchId: number) => void;
  isSimple: boolean;
};

const MatchesView = ({
  match,
  matchSelect,
  isSimple,
}: MatchesViewPropsType) => {
  const { windowSize } = useWindowSize();

  if (windowSize === 'SP')
    return <SimpleFightBox onClick={matchSelect} matchData={match} />;
  if (isSimple)
    return <SimpleFightBox onClick={matchSelect} matchData={match} />;
  if (windowSize === 'PC')
    return <FightBox onClick={matchSelect} matchData={match} />;
};
