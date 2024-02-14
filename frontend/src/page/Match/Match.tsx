import { MatchContainer } from '@/components/module/MatchContainer';
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';

export const Match = () => {
  //? 過去の試合は取得せず、予定された試合だけを取得
  const { data: matches } = useFetchMatches();
  return <MatchContainer matches={matches} />;
};
