import { SimpleFightBox } from "./SimpleFightBox";
// ! hooks
import { useFetchMatches } from "@/hooks/useMatch";

export const TestModule = () => {
  const { data: matchesData } = useFetchMatches();

  return (
    <>
      <h1>test</h1>
      {matchesData && (
        <SimpleFightBox onClick={() => {}} matchData={matchesData[2]} />
      )}
    </>
  );
};
