import { MatchComponent } from '@/components/module/MatchComponent';
import { NewMatchComponent } from './NewMatch/components/NewMatchComponent';
import { useFetchPastMatches } from '@/hooks/apiHooks/useMatch';

export const PastMatch = () => {
  //? 過去の試合だけ取得してpropsで渡す
  const { data: matches } = useFetchPastMatches();
  return <NewMatchComponent matches={matches} />;
};
