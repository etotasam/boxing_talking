import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { GRADE, ORGANIZATIONS, STANCE, WEIGHT_CLASS } from '@/constants/boxerData';
import { COUNTRY } from '@/constants/country';
import type { MatchDataType, MatchResultType, RegisterMatchPropsType } from '@/types';

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

export const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

const redBoxer = {
  id: 1,
  name: '井上尚弥',
  engName: 'Naoya Inoue',
  birth: '1993-04-10',
  height: 165,
  reach: 171,
  style: STANCE.ORTHODOX,
  country: COUNTRY.JAPAN,
  win: 26,
  ko: 23,
  draw: 0,
  lose: 0,
  titles: [],
};

const blueBoxer = {
  id: 2,
  name: 'ノニト・ドネア',
  engName: 'Nonito Donaire',
  birth: '1982-11-16',
  height: 170,
  reach: 173,
  style: STANCE.ORTHODOX,
  country: COUNTRY.PHILIPPINES,
  win: 42,
  ko: 28,
  draw: 0,
  lose: 7,
  titles: [],
};

export const match: MatchDataType = {
  id: 10,
  redBoxer,
  blueBoxer,
  country: COUNTRY.JAPAN,
  venue: 'さいたまスーパーアリーナ',
  grade: GRADE.TITLE_MATCH,
  titles: [
    {
      organization: ORGANIZATIONS.WBA,
      weightDivision: WEIGHT_CLASS.BANTAM,
    },
  ],
  weight: WEIGHT_CLASS.BANTAM,
  matchDate: '2024-05-06',
  result: null,
};

export const matchesResponse = {
  data: {
    data: [match],
  },
};

export const singleMatchResponse = {
  data: {
    data: match,
  },
};

export const registerMatchInput: RegisterMatchPropsType = {
  matchDate: '2024-05-06',
  redBoxerId: 1,
  blueBoxerId: 2,
  grade: GRADE.TITLE_MATCH,
  country: COUNTRY.JAPAN,
  venue: 'さいたまスーパーアリーナ',
  weight: WEIGHT_CLASS.BANTAM,
  titles: [ORGANIZATIONS.WBA],
};

export const updateMatchInput = {
  matchId: match.id,
  venue: '東京ドーム',
};

export const matchResultInput: MatchResultType = {
  isUpdateBoxerRecordChecked: true,
  matchId: match.id,
  result: 'red',
  detail: 'ko',
  round: '6',
};
