import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/routePath';
// ! components
import { Matches } from '@/components/module/Matches';
// ! hooks
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';
import { useSortMatches } from '@/hooks/useSortMatches';

export const Home = () => {
  const { data: matchesData } = useFetchMatches();
  const { beforeMatches, afterMatches } = useSortMatches(matchesData);
  const navigate = useNavigate();

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.MATCH}?match_id=${matchId}`);
  };

  return (
    <div className="flex flex-col">
      <div className="relative flex-1">
        <Matches
          beforeMatches={beforeMatches}
          afterMatches={afterMatches}
          toMatchPage={matchSelect}
        />
      </div>
    </div>
  );
};
