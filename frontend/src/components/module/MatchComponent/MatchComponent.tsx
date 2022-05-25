import dayjs from "dayjs";
import { MatchesType } from "@/libs/hooks/useMatches";
import { WINDOW_WIDTH } from "@/libs/utils";
//! hooks
import { useGetWindowWidth } from "@/libs/hooks/useGetWindowWidth";
//! component
import { Fighter, FighterMin } from "@/components/module/Fighter";

type Props = {
  match: MatchesType;
  className?: string;
  onClick?: (matchId: number) => void;
};

export const MatchComponent = ({ match, className, onClick = () => null }: Props) => {
  enum MatchIs {
    TODAY = "text-red-600",
    PAST = "text-gray-400",
    FUTURE = "text-white",
  }
  const matchDayStyle = (subjectDate: Date): MatchIs | undefined => {
    const today = dayjs().format("YYYY/MM/DD");
    const subDate = dayjs(subjectDate).format("YYYY/MM/DD");
    if (today === subDate) return MatchIs.TODAY;
    if (today > subDate) return MatchIs.PAST;
    if (today < subDate) return MatchIs.FUTURE;
  };

  const windowWidth = useGetWindowWidth();

  return (
    <div key={match.id} className={`px-4 pt-4 ${className}`}>
      <h1 className={`bg-stone-700 py-1 pl-3 ${matchDayStyle(match.date as Date)}`}>
        {match.date}
      </h1>
      <div
        onClick={() => onClick(match.id)}
        className="flex cursor-pointer border-x border-b border-stone-400"
      >
        {windowWidth > WINDOW_WIDTH.md ? (
          <>
            <Fighter fighter={match.red} cornerColor={"red"} className={"bg-stone-100 w-1/2"} />
            <Fighter fighter={match.blue} cornerColor={"blue"} className={"bg-stone-100 w-1/2"} />
          </>
        ) : (
          <>
            <FighterMin fighter={match.red} cornerColor={"red"} className={"bg-stone-100 w-1/2"} />
            <FighterMin
              fighter={match.blue}
              cornerColor={"blue"}
              className={"bg-stone-100 w-1/2"}
            />
          </>
        )}
      </div>
    </div>
  );
};
