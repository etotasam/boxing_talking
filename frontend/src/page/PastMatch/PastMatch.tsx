import { MatchContainer } from '@/components/module/MatchContainer';
import { useFetchPastMatches } from '@/hooks/apiHooks/useMatch';

export const PastMatch = () => {
  //? 過去の試合だけ取得してpropsで渡す
  const { data: matches } = useFetchPastMatches();
  return <MatchContainer matches={matches} />;
};
