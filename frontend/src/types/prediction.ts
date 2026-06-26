export type PredictionType = {
  id: number;
  matchId: number;
  prediction: 'red' | 'blue';
};

type VisibleMatchPredictionsType = {
  isVisible: true;
  totalVotes: number;
  red: number;
  blue: number;
};

type HiddenMatchPredictionsType = {
  isVisible: false;
  totalVotes: null;
  red: null;
  blue: null;
};

export type MatchPredictionsType = VisibleMatchPredictionsType | HiddenMatchPredictionsType;
