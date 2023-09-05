import clsx from "clsx";
import dayjs from "dayjs";
// ! image
import crown from "@/assets/images/etc/champion.svg";
// ! types
import { BoxerType } from "@/assets/types";
// ! components
import { FlagImage } from "@/components/atomc/FlagImage";

type PropsType = React.ComponentProps<"div"> & { boxer: BoxerType };

export const BoxerInfo = ({ boxer, className }: PropsType) => {
  const currentDate = dayjs();
  return (
    <div className={clsx("w-[300px] h-full flex justify-center", className)}>
      {/* <div className="h-[60%] border-b-[1px] border-stone-300">データ</div> */}
      <div className="text-center w-full px-5 py-10">
        <div>
          <div className="relative flex items-center justify-center">
            <span className="absolute top-[-25px] left-[50%] translate-x-[-50%] text-sm text-gray-600">
              {boxer.eng_name}
            </span>
            <h2 className="relative">
              {/* 国旗 */}
              <span className="w-[32px] h-[24px] border-[1px] overflow-hidden absolute top-0 left-[-40px]">
                <FlagImage nationaly={boxer.country} />
              </span>
              {boxer.name}
            </h2>
          </div>
          {/* 戦績 */}
          <div>
            <ul className="flex justify-between w-full mt-10 text-white">
              <li className="relative flex-1 bg-red-500 before:content-['WIN'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                {boxer.win}
                <span className="absolute text-sm bottom-[-20px] left-[50%] text-gray-600 translate-x-[-50%] after:content-['KO']">
                  {boxer.ko}
                </span>
              </li>
              <li className="relative flex-1 bg-gray-500 before:content-['DRAW'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                {boxer.draw}
              </li>
              <li className="relative flex-1 bg-stone-800 before:content-['LOSE'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                {boxer.lose}
              </li>
            </ul>
          </div>
          {/* ステータス */}
          <div className="mt-8">
            <ul>
              <li className="flex justify-between mt-2">
                <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                  年齢
                </p>
                <p className="flex-1">
                  {currentDate.diff(dayjs(boxer.birth), "year")}
                </p>
              </li>
              <li className="flex justify-between mt-2">
                <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                  身長
                </p>
                <p className="flex-1 after:content-['cm'] after:ml-1">
                  {boxer.height}
                </p>
              </li>
              <li className="flex justify-between mt-2">
                <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                  リーチ
                </p>
                <p className="flex-1 after:content-['cm'] after:ml-1">
                  {boxer.reach}
                </p>
              </li>
              <li className="flex justify-between mt-2">
                <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                  スタイル
                </p>
                <p className="flex-1">
                  {boxer.style === "orthodox" ? "オーソドックス" : "サウスポー"}
                </p>
              </li>
            </ul>
          </div>
          {/* タイトル */}
          <div className="mt-5">
            {boxer.title_hold && (
              <ul>
                {boxer.title_hold.map((belt: string) => (
                  <li key={belt} className="mt-2">
                    <p className="relative inline-block">
                      <span className="absolute top-[2px] left-[-23px] w-[18px] h-[18px] mr-2">
                        <img src={crown} alt="" />
                      </span>
                      {belt}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
