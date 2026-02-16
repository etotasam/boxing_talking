export type PredictionType = {
  id: number;
  matchId: number;
  prediction: "red" | "blue";
};

export type MatchPredictionsType = {
  totalVotes: number;
  red: number;
  blue: number;
};
