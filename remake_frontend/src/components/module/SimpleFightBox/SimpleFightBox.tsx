import dayjs from 'dayjs';
import clsx from 'clsx';
// ! types
import { MatchesDataType } from '@/assets/types';
// ! components
import { EngNameWithFlag } from '@/components/atomc/EngNameWithFlag';
import { PredictionVoteIcon } from '@/components/atomc/PredictionVoteIcon';
// ! image
import crown from '@/assets/images/etc/champion.svg';
// ! type
import { BoxerType } from '@/assets/types';

type PropsType = {
  matchData: MatchesDataType;
  onClick: (matchId: number) => void;
  className?: string;
  isPredictionVote: boolean | undefined;
};

export const SimpleFightBox = ({
  matchData,
  onClick,
  isPredictionVote,
}: PropsType) => {
  return (
    <>
      {matchData && (
        <div
          onClick={() => onClick(matchData.id)}
          className="relative flex justify-between md:w-[90%] w-full max-w-[1024px] cursor-pointer md:py-4 py-8 md:border-[1px] border-b-[1px] border-stone-400 md:rounded-md md:hover:bg-yellow-100 md:hover:border-white md:duration-300"
        >
          <BoxerBox boxer={matchData.red_boxer} />

          <MatchInfo matchData={matchData} />

          <BoxerBox boxer={matchData.blue_boxer} />
          <PredictionVoteIcon isPredictionVote={isPredictionVote} />
        </div>
      )}
    </>
  );
};

const MatchInfo = ({ matchData }: { matchData: MatchesDataType }) => {
  return (
    <>
      {/* //? 日時 */}
      <div className="py-5 text-stone-600 flex-1">
        <div className="text-center relative">
          <h2 className="xl:text-xl lg:text-lg text-md after:content-['(日本時間)'] after:w-full after:absolute md:after:bottom-[-60%] after:bottom-[-60%] after:left-[50%] after:translate-x-[-50%] xl:after:text-sm after:text-[12px]">
            {dayjs(matchData.match_date).format('YYYY年M月D日')}
          </h2>
          {matchData.titles.length > 0 && (
            <span className="absolute top-[-24px] left-[50%] translate-x-[-50%] w-[24px] h-[24px] mr-2">
              <img src={crown} alt="" />
            </span>
          )}
        </div>
      </div>
    </>
  );
};

const BoxerBox = ({ boxer }: { boxer: BoxerType }) => {
  return (
    <div className="md:w-[300px] flex justify-center items-center flex-1">
      {/* //? 名前 */}
      <div className="flex flex-col justify-center items-center">
        <EngNameWithFlag
          boxerCountry={boxer.country}
          boxerEngName={boxer.eng_name}
        />
        <h2
          className={clsx(
            'lg:text-[20px] sm:text-[16px] mt-1',
            boxer.name.length > 7 ? `text-[12px]` : `text-[16px]`
          )}
        >
          {boxer.name}
        </h2>
      </div>
    </div>
  );
};
