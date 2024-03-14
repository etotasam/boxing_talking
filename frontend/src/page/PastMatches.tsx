import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_PATH } from '@/assets/routePath';
import { useInView } from 'react-intersection-observer';
//! layout
import HeaderAndFooterLayout from '@/layout/HeaderAndFooterLayout';
// ! components
import { SimpleMatchCard } from '@/components/module/SimpleMatchCard';
//! hooks
import { useFetchPastMatches } from '@/hooks/apiHooks/useMatch';
import { useLoading } from '@/hooks/useLoading';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const PastMatches = () => {
  const { resetLoadingState } = useLoading();
  const { data: pastMatches } = useFetchPastMatches();

  const navigate = useNavigate();

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  const matchSelect = (matchId: number) => {
    navigate(`${ROUTE_PATH.PAST_MATCH_SINGLE}?match_id=${matchId}`);
  };

  //? 過去の試合が見つからない時
  if (pastMatches && Boolean(!pastMatches.length))
    return (
      <HeaderAndFooterLayout>
        <Helmet>
          <title>過去の試合 | {siteTitle}</title>
        </Helmet>
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <div>過去の試合が見つかりませんでした</div>
        </div>
      </HeaderAndFooterLayout>
    );

  //? 正常にデータ取得が完了した時
  return (
    <>
      <Helmet>
        <title>過去の試合 | {siteTitle}</title>
      </Helmet>
      <HeaderAndFooterLayout>
        {pastMatches && (
          <ul className="md:py-10">
            {pastMatches.map((match) => (
              <li
                key={match.id}
                className="w-full h-full flex justify-center items-center px-2 pb-3 first:mt-0"
              >
                <SimpleMatchCard matchData={match} onClick={matchSelect} />
              </li>
            ))}
          </ul>
        )}
      </HeaderAndFooterLayout>
    </>
  );
};
