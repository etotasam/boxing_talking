import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/routePath';
import { Matches } from '@/components/module/Matches';
import { useFetchMatches } from '@/hooks/apiHooks/match';
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
