import { useCallback } from 'react';
import { ROUTE_PATH } from '@/assets/routePath';
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
      <div
        ref={footerRef}
        className="relative w-full h-[50px] border-t-[1px] border-stone-200 text-stone-400"
      >
        <div className="flex absolute bottom-2 right-10">
          {location.pathname !== '/terms' && (
            <Link to={ROUTE_PATH.TERMS} className="text-stone-500 text-sm mr-5">
              利用規約
            </Link>
          )}
          <p className="md:text-sm text-[8px] select-none">©2023 BOXING TALKING</p>
        </div>
      </div>
    </>
  );
};
