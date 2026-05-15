import clsx from 'clsx';
import { GiImperialCrown } from 'react-icons/gi';
import { MatchDataType } from '@/types';

export const Grade = ({ matchData }: { matchData: MatchDataType }) => {
  const isTitleMatch = matchData.grade === 'タイトルマッチ';
  const isOneTitle = matchData.titles.length === 1;
  const isUnificationMatch = matchData.titles.length > 1;
  return (
    <div className={clsx('font-clamp-level-1 flex-1 text-white')}>
      <div className={clsx('flex justify-center whitespace-nowrap')}>
        <div className="flex items-end">
          <span className="">{matchData.weight}級</span>

          {isOneTitle && (
            <span className="relative ml-1">
              <GiImperialCrown className="text-yellow-500 w-[30px] h-[30px]" />
              <CrownIconContainer title={matchData.titles[0].organization} />
            </span>
          )}
          {!isTitleMatch && <span className="ml-3">{matchData.grade}</span>}
        </div>
      </div>
      {isUnificationMatch && (
        <div className="flex justify-center mt-1">
          {matchData.titles.map((title) => (
            <div key={title.organization} className="relative ml-2 first-of-type:ml-0">
              <GiImperialCrown className="text-yellow-500 w-[30px] h-[30px]" />
              <CrownIconContainer title={title.organization} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CrownIconContainer = ({ title }: { title: string }) => {
  const index = title.indexOf('暫定');
  const titleArray: string[] | undefined =
    index !== -1 ? [title.slice(0, index), title.slice(index)] : undefined;

  return titleArray && titleArray.length ? (
    <span className="text-[13px] absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur w-full">
      <span className="w-full absolute top-[-18px]">{titleArray[1]}</span>
      <span className="w-full absolute top-[-8px]">{titleArray[0]}</span>
    </span>
  ) : (
    <span className="text-[13px] absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-blur">
      {title}
    </span>
  );
};
