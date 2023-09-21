import clsx from 'clsx';
import dayjs from 'dayjs';
// ! image
import crown from '@/assets/images/etc/champion.svg';
// ! types
import { BoxerType } from '@/assets/types';
// ! components
import { EngNameWithFlag } from '@/components/atomc/EngNameWithFlag';

type PropsType = React.ComponentProps<'div'> & { boxer: BoxerType };

export const BoxerInfo = ({ boxer, className }: PropsType) => {
  const currentDate = dayjs();
  return (
    <div className={clsx('w-[300px] h-full flex justify-center', className)}>
      {/* <div className="h-[60%] border-b-[1px] border-stone-300">データ</div> */}
      <div className="text-center w-full px-5 py-5">
        <div>
          {/* //? 名前 */}
          <div className="">
            <EngNameWithFlag
              boxerCountry={boxer.country}
              boxerEngName={boxer.eng_name}
            />
            <h2 className="text-[18px] mt-1">{boxer.name}</h2>
          </div>
          {/* //? 戦績 */}
          <ul className="flex justify-between w-full mt-7 text-white">
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
          {/* //? ステータス */}
          <ul className="mt-8">
            <li className="flex justify-between mt-1">
              <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                年齢
              </p>
              <p className="flex-1">
                {currentDate.diff(dayjs(boxer.birth), 'year')}
              </p>
            </li>
            <li className="flex justify-between mt-1">
              <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                身長
              </p>
              {boxer.height ? (
                <p className="flex-1 after:content-['cm'] after:ml-1">
                  {boxer.height}
                </p>
              ) : (
                <p className="flex-1">-</p>
              )}
            </li>
            <li className="flex justify-between mt-1">
              <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                リーチ
              </p>
              {boxer.reach ? (
                <p className="flex-1 after:content-['cm'] after:ml-1">
                  {boxer.reach}
                </p>
              ) : (
                <p className="flex-1">-</p>
              )}
            </li>
            <li className="flex justify-between mt-1">
              <p className="flex-1 text-sm text-stone-500 flex items-center justify-center">
                スタイル
              </p>
              <p className="flex-1">
                {boxer.style === 'orthodox' && 'オーソドックス'}
                {boxer.style === 'southpaw' && 'サウスポー'}
                {boxer.style === 'unknown' && '-'}
              </p>
            </li>
          </ul>
          {/* //? タイトル */}
          {boxer.title_hold.length > 0 && (
            <ul className="mt-3">
              {boxer.title_hold.sort().map((belt: string) => (
                <li key={`belt_${belt}`} className="mt-2">
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
  );
};
