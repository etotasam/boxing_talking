import { Matches } from './Matches';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
// ! hooks
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';
import { useSortMatches } from '@/hooks/useSortMatches';

export const MatchesContainer = () => {
  const { data: matchesData } = useFetchMatches();
  const { beforeMatches, afterMatches } = useSortMatches(matchesData);
  const navigate = useNavigate();

  // useEffect(() => {
  //   return () => {
  //     resetLoadingState();
  //   };
  // }, []);

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.MATCH}?match_id=${matchId}`);
  };

  return (
    <>
      <Matches
        beforeMatches={beforeMatches}
        afterMatches={afterMatches}
        toMatchPage={matchSelect}
      />
    </>
  );
};
