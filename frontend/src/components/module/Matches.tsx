import clsx from 'clsx';
import { MatchDataType } from '@/types';
// ! components
import { SimpleMatchCard } from '@/components/module/SimpleMatchCard';
import { useRecoilValue } from 'recoil';
import { deviceState } from '@/store/deviceState';

type MatchesPropsType = {
  beforeMatches: MatchDataType[];
  afterMatches: MatchDataType[];
  toMatchPage: (matchId: number) => void;
};
export const Matches = ({ beforeMatches, toMatchPage, afterMatches }: MatchesPropsType) => {
  const device = useRecoilValue(deviceState);

  return (
    <>
      {!!beforeMatches.length && (
        <MatchesListComponent matches={beforeMatches} toMatchPage={toMatchPage} />
      )}

      {!!afterMatches.length && (
        <div className="mt-5">
          <div className="flex justify-center">
            <div
              // onClick={() => setIsShow(true)}
              className={clsx(
                'relative w-full max-w-[1024px] pc:w-[80%] text-white tracking-widest',
                device === 'SP' ? 'px-2' : 'px-0'
              )}
            >
              <p className="after:absolute after:top-[-10px] after:left-0 after:bg-white after:h-[1px] after:w-full">
                直近の試合
              </p>
            </div>
          </div>

          <MatchesListComponent matches={afterMatches} toMatchPage={toMatchPage} />
        </div>
      )}
    </>
  );
};

const MatchesListComponent = ({
  matches,
  toMatchPage,
}: {
  matches: MatchDataType[];
  toMatchPage: (matchId: number) => void;
}) => {
  return (
    <ul className={clsx('pc:pt-10 pt-6')}>
      {matches.map((match) => (
        <li
          key={match.id}
          className={clsx('w-full h-full flex justify-center items-center pb-3 first:mt-0', 'px-2')}
        >
          <SimpleMatchCard onClick={toMatchPage} matchData={match} />
        </li>
      ))}
    </ul>
  );
};
