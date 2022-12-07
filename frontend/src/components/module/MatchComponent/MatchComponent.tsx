import dayjs from "dayjs";
import { MatchesType } from "@/libs/hooks/useMatches";
// import { WINDOW_WIDTH } from "@/libs/utils";
//! hooks
// import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
//! component
// import { Fighter } from "@/components/module/Fighter";
import { TestFighter } from "@/components/module/TestFighter";

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

  // const { width: windowWidth } = useGetWindowSize();

  return (
    <div key={match.id} className={`px-1 md:px-4 pt-4 ${className}`}>
      <h1 className={`bg-stone-700 py-1 pl-3 text-center ${matchDayStyle(match.date as Date)}`}>
        {dayjs(match.date).format("YYYY月M月D日")}
      </h1>
      <div
        onClick={() => onClick(match.id)}
        className="flex cursor-pointer border-x border-b border-stone-400"
      >
        <TestFighter fighter={match.red} cornerColor={"red"} className={"bg-stone-100 w-1/2"} />
        <TestFighter fighter={match.blue} cornerColor={"blue"} className={"bg-stone-100 w-1/2"} />
        {/* <Fighter fighter={match.red} cornerColor={"red"} className={"bg-stone-100 w-1/2"} />
        <Fighter fighter={match.blue} cornerColor={"blue"} className={"bg-stone-100 w-1/2"} /> */}
      </div>
    </div>
  );
};
