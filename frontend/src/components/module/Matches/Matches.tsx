import { useEffect } from 'react';
import { SpHome } from './SpHome';
import { PcHome } from './PcHome';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
// ! hooks
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';
import { useLoading } from '@/hooks/useLoading';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useSortMatches } from '@/hooks/useSortMatches';

export const Matches = () => {
  const { device } = useWindowSize();
  const { resetLoadingState } = useLoading();
  const { data: matchesData } = useFetchMatches();
  const { beforeMatches, afterMatches } = useSortMatches(matchesData);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.MATCH}?match_id=${matchId}`);
  };

  return (
    <>
      {device == 'PC' && (
        <PcHome
          beforeMatches={beforeMatches}
          afterMatches={afterMatches}
          toMatchPage={matchSelect}
        />
      )}

      {device == 'SP' && (
        <SpHome
          beforeMatches={beforeMatches}
          afterMatches={afterMatches}
          toMatchPage={matchSelect}
        />
      )}
    </>
  );
};
