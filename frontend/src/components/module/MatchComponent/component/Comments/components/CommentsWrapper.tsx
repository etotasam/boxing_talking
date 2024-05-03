import { useRef, useEffect } from 'react';
import clsx from 'clsx';
//! recoil
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { boolState } from '@/store/boolState';
//!hook
import { useWindowSize } from '@/hooks/useWindowSize';

type CommentsWrapperType = {
  children?: React.ReactNode;
};
export const CommentsWrapper = (props: CommentsWrapperType) => {
  const el = useRef<HTMLDivElement>(null);
  const postCommentElHeight = useRecoilValue(elementSizeState('POST_COMMENT_HEIGHT'));
  const headerElHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const setIsScroll = useSetRecoilState(boolState('IS_SCROLL'));

  const { device } = useWindowSize();

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
    <>
      <div
        ref={el}
        className={clsx(
          'relative w-full flex justify-center',
          device === 'PC' ? 'my-scroll-y' : 'overflow-auto'
        )}
        style={{
          paddingTop: `${headerElHeight}px`,
          height: `calc(100vh - (${postCommentElHeight}px) - 1px)`,
        }}
      >
        {children}
      </div>
    </>
  );
};
