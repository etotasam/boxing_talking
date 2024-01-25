import { MatchContainer } from '@/components/module/MatchContainer';
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';

export const Match = () => {
  const { data: matches } = useFetchMatches();
  return <MatchContainer matches={matches} />;
};
