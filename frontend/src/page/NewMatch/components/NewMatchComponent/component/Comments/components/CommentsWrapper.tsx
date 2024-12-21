import { useRef, useEffect } from 'react';
import clsx from 'clsx';
//! recoil
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { boolState } from '@/store/boolState';
//!hook
import { modalState } from '@/store/modalState';

type CommentsWrapperType = {
  children?: React.ReactNode;
};
export const CommentsWrapper = (props: CommentsWrapperType) => {
  const el = useRef<HTMLDivElement>(null);
  const commentPostElementHeightState = useRecoilValue(elementSizeState('POST_COMMENT_HEIGHT'));
  const [isShowCommentsModalState, setIsShowCommentsModalState] = useRecoilState(
    modalState('COMMENTS_MODAL')
  );
  const setIsScroll = useSetRecoilState(boolState('IS_SCROLL'));

  //? ↓↓↓ページを離れたらコメントモーダルを閉じる(Recoilで管理してるので記憶されるs)↓↓↓
  useEffect(() => {
    return () => {
      setIsShowCommentsModalState(false);
    };
  }, []);

  //? ↓↓↓scroll中かどうかの判定↓↓↓
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const makeScrollState = () => {
    setIsScroll(true);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      setIsScroll(false);
    }, 500);
  };

  useEffect(() => {
    if (!el.current) return;

    el.current.addEventListener('scroll', makeScrollState);
    return () => {
      el.current?.removeEventListener('scroll', makeScrollState);
    };
  }, [el]);
  //? ↑↑↑scroll中かどうかの判定↑↑↑

  const { children } = props;
  return (
    <div
      ref={el}
      className={clsx(
        'relative w-full flex justify-center scroll-bar-gray',
        isShowCommentsModalState ? 'overflow-auto' : 'overflow-hidden'
      )}
      style={{
        height: `calc(80vh - (${commentPostElementHeightState}px) - 1px)`,
      }}
    >
      {children}
    </div>
  );
};
