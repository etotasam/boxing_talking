import React from 'react';
import { NewMatchComponent } from './components/NewMatchComponent';
import { useFetchMatches } from '@/hooks/apiHooks/useMatch';

export const NewMatch = () => {
  const { data: matches } = useFetchMatches();
  return <NewMatchComponent matches={matches} />;
};
