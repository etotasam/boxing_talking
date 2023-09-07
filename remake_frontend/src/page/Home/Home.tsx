import { Helmet } from "react-helmet";
// ! components
import { FightBox } from "@/components/module/FightBox";
import { LinkList } from "@/components/module/LinkList";
// ! hooks
import { useFetchMatches } from "@/hooks/useMatch";

export const Home = () => {
  // ! use hook
  const { data: matchesData } = useFetchMatches();

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <div className="my-10">
        <ul>
          {matchesData &&
            matchesData.map((match) => (
              <FightBox
                key={match.id}
                matchData={match}
                className="border-[1px] border-stone-300 rounded-md"
              />
            ))}
        </ul>
      </div>
    </>
  );
};
