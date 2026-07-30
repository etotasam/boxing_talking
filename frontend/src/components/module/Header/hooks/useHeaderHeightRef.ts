import { useLayoutEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

/** ヘッダーの外形高を監視し、レイアウト用の共有状態へ反映する。 */
export const useHeaderHeightRef = () => {
  const headerRef = useRef<HTMLElement>(null);
  const setHeaderHeight = useSetRecoilState(elementSizeState('HEADER_HEIGHT'));
  const previousHeightRef = useRef<number>();

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = (height: number) => {
      if (previousHeightRef.current !== height) {
        previousHeightRef.current = height;
        setHeaderHeight(height);
      }
    };

    updateHeaderHeight(header.getBoundingClientRect().height);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const height =
          entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
        updateHeaderHeight(height);
      });
    });

    observer.observe(header, { box: 'border-box' });

    return () => observer.disconnect();
  }, [setHeaderHeight]);

  return headerRef;
};
