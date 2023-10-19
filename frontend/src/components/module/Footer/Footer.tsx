import { ROUTE_PATH } from '@/assets/RoutePath';
import { Link, useLocation } from 'react-router-dom';
import { useFooterHeight } from '@/hooks/useFooterHeight';
import { useEffect, useRef } from 'react';

export const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    setFooterHeight(footerRef.current.clientHeight);
  }, [footerRef.current]);

  const { setter: setFooterHeight } = useFooterHeight();
  const location = useLocation();
  return (
    <>
      <div
        ref={footerRef}
        className="relative w-full h-[50px] border-t-[1px] border-stone-200 text-stone-400"
      >
        <div className="flex absolute bottom-2 right-10">
          {location.pathname !== '/terms' && (
            <Link to={ROUTE_PATH.Terms} className="text-stone-500 text-sm mr-5">
              利用規約
            </Link>
          )}
          <p className="md:text-sm text-[8px] select-none">
            ©2023 BOXING TALKING
          </p>
        </div>
      </div>
    </>
  );
};
