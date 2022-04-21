import dayjs from "dayjs";
import { MatchesType } from "@/libs/apis/matchAPI";

// component
import { Fighter } from "@/components/module/Fighter";

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
  return (
    <div key={match.id} className={`px-4 pt-4 ${className}`}>
      <h1 className={`bg-stone-700 py-1 pl-3 ${matchDayStyle(match.date)}`}>{match.date}</h1>
      <div onClick={() => onClick(match.id)} className="flex cursor-pointer border-x border-b border-stone-400">
        <Fighter fighter={match.red} cornerColor={"red"} className={"w-1/2"} />
        <Fighter fighter={match.blue} cornerColor={"blue"} className={"w-1/2"} />
      </div>
    </div>
  );
};
