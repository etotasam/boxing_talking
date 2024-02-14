/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
//! component
import { Boxers } from '.';
//! hooks
import { useWindowSize } from '@/hooks/useWindowSize';
import { useFetchComments } from '@/hooks/apiHooks/useComment';
import { useModalState } from '@/hooks/useModalState';
//! type
import { MatchDataType } from '@/assets/types';
//! context
import {
  ThisMatchPredictionByUserContext,
  // ThisMatchPredictionCountContext,
  IsThisMatchAfterTodayContext,
} from '../..';
//! recoil
import { useSetRecoilState } from 'recoil';
import { boxerInfoDataState } from '@/store/boxerInfoDataState';
import { elementSizeState } from '@/store/elementSizeState';

type ContainerPropsType = {
  thisMatch: MatchDataType | undefined;
};

export const BoxersContainer = (props: ContainerPropsType) => {
  const { thisMatch } = props;
  //? windowのサイズ
  const { device } = useWindowSize();
  //? コメントの取得状態
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const matchId = Number(query.get('match_id'));
  //? コメント投稿中かどうか(hook内でRecoilにて管理)
  const { isLoading: isFetchCommentsLoading } = useFetchComments(matchId);
  //? この試合へのuserの勝敗予想をcontextから取得
  const thisMatchPredictionByUser = useContext(
    ThisMatchPredictionByUserContext
  );
  //? この試合が未来かどうかをcontextから取得
  const isThisMatchAfterToday = useContext(IsThisMatchAfterTodayContext);

  //? モーダルの開閉状態(boxer info)
  const { showModal: showBoxerInfoModal } = useModalState('BOXER_INFO');
  //? モーダルの開閉状態(勝敗予想の投票モーダル)
  const { showModal: showPredictionVoteModal } =
    useModalState('PREDICTION_VOTE');
  //? boxer info modalに表示するデータを取得(Recoil)
  const setBoxerInfoData = useSetRecoilState(boxerInfoDataState);
  //? boxer info modalにデータをセット and 表示
  const showAndSetBoxerInfoModal = (boxerColor: 'red' | 'blue') => {
    if (device !== 'SP') return;
    if (!thisMatch) return;
    const boxerData =
      boxerColor === 'red' ? thisMatch.red_boxer : thisMatch.blue_boxer;
    setBoxerInfoData({ ...boxerData, color: boxerColor });
    showBoxerInfoModal();
  };

  const setBoxerElHeight = useSetRecoilState(
    elementSizeState('MATCH_PAGE_BOXER_SECTION_HEIGHT')
  );
  const boxersRef = useRef(null);
  useEffect(() => {
    if (!boxersRef.current) return;
    const height = (boxersRef.current as HTMLDivElement).clientHeight;
    setBoxerElHeight(height);
  }, [boxersRef.current]);

  return (
    <Boxers
      thisMatch={thisMatch}
      boxersRef={boxersRef}
      device={device}
      isFetchCommentsLoading={isFetchCommentsLoading}
      thisMatchPredictionByUser={thisMatchPredictionByUser}
      isThisMatchAfterToday={isThisMatchAfterToday}
      showPredictionVoteModal={showPredictionVoteModal}
      showBoxerInfoModal={(boxerColor) => showAndSetBoxerInfoModal(boxerColor)}
    />
  );
};
