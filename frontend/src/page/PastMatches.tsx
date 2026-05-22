import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/constants/routePath';
import { MatchCard } from '@/components/module/MatchCard';
import { useFetchPastMatches } from '@/hooks/apiHooks/match';
import { MatchDataType } from '@/types';
import { useCallback } from 'react';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const PastMatches = () => {
  const { data: pastMatches } = useFetchPastMatches();

  const navigate = useNavigate();

  const matchSelect = useCallback(
    (matchId: number) => {
      navigate(`${ROUTE_PATH.PAST_MATCH_SINGLE}?match_id=${matchId}`);
    },
    [navigate]
  );

  //? データ取得中
  if (!pastMatches) return <Loading />;

  //? 過去の試合が見つからない時
  if (pastMatches.length === 0) return <NoMatches />;

  //? 正常にデータ取得が完了した時
  return <ShowMatches pastMatches={pastMatches} matchSelect={matchSelect} />;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Helmet>
        <title>過去の試合 | {siteTitle}</title>
      </Helmet>
      <div className="flex flex-col">{children}</div>
    </>
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
    <Layout>
      <div className="flex-1">
        <ul className="pc:py-10 pt-6">
          {pastMatches.map((match) => (
            <li
              key={match.id}
              className="w-full h-full flex justify-center items-center pb-3 first:mt-0 px-2"
            >
              <MatchCard matchData={match} onClick={matchSelect} />
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

const NoMatches = () => {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center">
        <div>過去の試合が見つかりませんでした</div>
      </div>
    </Layout>
  );
};

const Loading = () => {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    </Layout>
  );
};
