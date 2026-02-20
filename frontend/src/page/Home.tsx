import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
// ! components
import { Matches } from '@/components/module/Matches';
import { Footer } from '@/components/module/Footer';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
// ! hooks
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';
import { useSortMatches } from '@/hooks/useSortMatches';

export const Home = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const { data: matchesData } = useFetchMatches();
  const { beforeMatches, afterMatches } = useSortMatches(matchesData);
  const navigate = useNavigate();

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.MATCH}?match_id=${matchId}`);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}>
      <div className="flex-1">
        <Matches
          beforeMatches={beforeMatches}
          afterMatches={afterMatches}
          toMatchPage={matchSelect}
        />
      </div>
      <Footer />
    </div>
  );
};
