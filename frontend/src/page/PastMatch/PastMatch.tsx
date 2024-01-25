import { MatchContainer } from '@/components/module/MatchContainer';
import { useFetchPastMatches } from '@/hooks/apiHooks/useMatch';

export const PastMatch = () => {
  const { data: matches } = useFetchPastMatches();
  return <MatchContainer matches={matches} />;
};
