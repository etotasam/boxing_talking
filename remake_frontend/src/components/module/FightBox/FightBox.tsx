import crown from "@/assets/images/etc/champion.svg";
// ! types
import { BoxerType, NationalityType, FightInfoType } from "@/assets/types";
// ! hook
import { useFetchBoxer } from "@/hooks/useBoxer";
// ! components
import { BoxerInfo } from "../BoxerInfo";
import { FlagImage } from "@/components/atomc/FlagImage";

type MatchInfoType = {
  date: string;
  country: NationalityType;
  place: string;
  matchGrade: string;
  titleMatch: string[];
  weight: string;
};

type PropsType = {
  boxer_1: BoxerType;
  boxer_2: BoxerType;
  matchInfo: MatchInfoType;
  className: string;
};

export const FightBox = ({
  boxer_1,
  boxer_2,
  matchInfo,
  className,
}: PropsType) => {
  return (
    <>
      {boxer_1 && boxer_2 && (
        <section className="w-full h-full flex justify-center items-center">
          <div className="flex justify-between mt-8 w-[80%] max-w-[1024px] min-w-[900px] cursor-pointer border-[1px] border-stone-400 rounded-md md:hover:bg-neutral-100 md:hover:border-white md:duration-300">
            <div className="w-[300px]">
              <BoxerInfo boxer={boxer_1} />
            </div>

            <MatchInfo matchInfo={matchInfo} />

            <div className="w-[300px]">
              <BoxerInfo boxer={boxer_2} />
            </div>
          </div>
        </section>
      )}
    </>
  );
};

const MatchInfo = ({ matchInfo }: { matchInfo: MatchInfoType }) => {
  return (
    <>
      {/* 日時 */}
      <div className="p-5 text-stone-600">
        <div className="text-center relative mt-5">
          <h2 className="text-2xl after:content-['(日本時間)'] after:absolute after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] after:text-sm">
            {matchInfo.date}
          </h2>
        </div>

        {/* グレード */}
        <div className="text-center text-xl mt-5">
          {matchInfo.matchGrade === "タイトルマッチ" ? (
            <ul className="flex flex-col">
              {matchInfo.titleMatch.map((title) => (
                <li key={title} className="mt-3">
                  <p className="relative inline-block">
                    <span className="absolute top-[4px] right-[-28px] w-[18px] h-[18px] mr-2">
                      <img src={crown} alt="" />
                    </span>
                    {title}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[30px] mt-10">{matchInfo.matchGrade}</p>
          )}
        </div>

        {/* 会場 */}
        <div className="mt-[50px] text-center">
          <p className="relative inline-block text-lg before:content-['会場'] before:absolute before:top-[-23px] before:left-[50%] before:translate-x-[-50%] before:text-[16px] before:text-stone-500">
            {matchInfo.place}
            <span className="w-[32px] h-[24px] border-[1px] overflow-hidden absolute top-[1px] left-[-40px]">
              <FlagImage nationaly={matchInfo.country} />
            </span>
          </p>
        </div>

        <div className="mt-10 text-center">
          <p className="relative inline-block text-lg before:content-['階級'] before:absolute before:top-[-23px] before:left-[50%] before:translate-x-[-50%] before:text-[16px] before:text-stone-500">
            {matchInfo.weight}
          </p>
        </div>
      </div>
    </>
  );
};
