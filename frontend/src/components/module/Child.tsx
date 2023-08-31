import { MatchesType } from "@/libs/hooks/useMatches";
import { useFetchMatchesTest } from "@/libs/hooks/useMatches";

type Props = {
  matches: MatchesType[] | undefined;
};

const Child = () => {
  const { data: matches } = useFetchMatchesTest();
  return (
    <>
      <ul>
        {matches?.map((match) => (
          <li key={match.id}>
            <p>{match.date}</p>
            <p>{match.red.name}</p>
            <p>{match.blue.name}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Child;
