import { createContext } from 'react';
import { MatchPredictionsType } from '@/types';

export type UsersPredictionType = 'red' | 'blue' | false | undefined;

export const UsersPredictionContext = createContext<UsersPredictionType>(undefined);

export const MatchPredictionsContext = createContext<MatchPredictionsType | undefined>(undefined);
