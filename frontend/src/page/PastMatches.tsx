import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/routePath';
// ! components
import { SimpleMatchCard } from '@/components/module/SimpleMatchCard';
import { Footer } from '@/components/module/Footer';
//! hooks
import { useFetchPastMatches } from '@/hooks/apiHooks/useMatch';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
// ! types
import { MatchDataType } from '@/types';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const PastMatches = () => {
  const { data: pastMatches } = useFetchPastMatches();
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  const navigate = useNavigate();

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.PAST_MATCH_SINGLE}?match_id=${matchId}`);
  };

  if (!pastMatches) return <div>読み込み中...</div>;

  //? 過去の試合が見つからない時
  if (pastMatches && Boolean(!pastMatches.length))
    return (
      <div className="flex flex-col" style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}>
        <NoMatches />
        <Footer />
      </div>
    );

  //? 正常にデータ取得が完了した時
  return (
    <div className="flex flex-col" style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}>
      <ShowMatches pastMatches={pastMatches} matchSelect={matchSelect} />
      <Footer />
    </div>
  );
};

const ShowMatches = ({
  pastMatches,
  matchSelect,
}: {
  pastMatches: MatchDataType[];
  matchSelect: (matchId: number) => void;
}) => {
  return (
    <>
      <Helmet>
        <title>過去の試合 | {siteTitle}</title>
      </Helmet>

      <div className="flex-1">
        {pastMatches && (
          <ul className="md:py-10">
            {pastMatches.map((match) => (
              <li
                key={match.id}
                className="w-full h-full flex justify-center items-center pb-3 first:mt-0"
              >
                <SimpleMatchCard matchData={match} onClick={matchSelect} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

const NoMatches = () => {
  return (
    <>
      <Helmet>
        <title>過去の試合 | {siteTitle}</title>
      </Helmet>
      <div className="flex-1 flex items-center justify-center">
        <div>過去の試合が見つかりませんでした</div>
      </div>
    </>
  );
};
