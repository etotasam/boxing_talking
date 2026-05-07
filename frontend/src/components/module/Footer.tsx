import { useCallback } from 'react';
import { ROUTE_PATH } from '@/constants/routePath';
import { Link, useLocation } from 'react-router-dom';
//! recoil
import { useSetRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

export const Footer = () => {
  //? footerの高さをRecoilにセット
  const footerRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      setFooterHeight(node.clientHeight);
    }
  }, []);

  const setFooterHeight = useSetRecoilState(elementSizeState('FOOTER_HEIGHT'));
  const location = useLocation();
  return (
    <>
      <footer
        ref={footerRef}
        className="mt-auto relative w-full h-[30px] border-stone-200 text-stone-400"
      >
        <div className="flex absolute bottom-2 right-10">
          {location.pathname !== '/terms' && (
            <Link to={ROUTE_PATH.TERMS} className="text-stone-500 pc:text-sm text-xs mr-5">
              利用規約
            </Link>
          )}
          <p className="pc:text-sm text-xs select-none">©2023 BOXING TALKING</p>
        </div>
      </footer>
    </>
  );
};
