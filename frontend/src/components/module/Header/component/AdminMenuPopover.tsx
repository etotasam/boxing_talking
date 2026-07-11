import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { IoChevronForwardOutline } from 'react-icons/io5';
import { useLocation } from 'react-router-dom';
import { AdminPageLink } from '@/constants/adminPageLinks';
import { AdminMenuButton, AdminPageLinkIcon, AdminPageLinkList } from '@/components/module/AdminNavigation';

const ADMIN_PAGE_LINKS_ID = 'pc-admin-page-links';

/** PCヘッダーで表示する管理ページリンクのポップオーバー。 */
export const AdminMenuPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="contents">
      <AdminMenuButton
        controlsId={ADMIN_PAGE_LINKS_ID}
        isOpen={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30',
          'text-white/80 transition-colors hover:bg-white/10 hover:text-white',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
        )}
      >
        <HiOutlineAdjustmentsHorizontal className="h-6 w-6" />
      </AdminMenuButton>

      {isOpen && (
        <div
          className="absolute right-6 top-full z-20 w-[260px] overflow-hidden rounded-b-md border border-white/20 bg-zinc-950 shadow-xl"
          data-testid="pc-admin-menu-popover"
          id={ADMIN_PAGE_LINKS_ID}
        >
          <AdminPageLinkList
            className="divide-y divide-white/15"
            getLinkClassName={(link) => getLinkClassName(link, pathname)}
          renderLinkContent={(link) => (
            <>
              <AdminPageLinkIcon link={link} />
              <span className="ml-4 flex-1 text-left">{link.name}</span>
              <IoChevronForwardOutline className="h-5 w-5 text-white/60" aria-hidden="true" />
            </>
          )}
          onNavigate={close}
        />
      </div>
      )}
    </div>
  );
};

const getLinkClassName = (link: AdminPageLink, pathname: string) =>
  clsx(
    'flex min-h-14 items-center px-5 text-[15px] font-bold text-white/85 transition-colors',
    'hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white',
    link.path === pathname && 'bg-white/10 text-white'
  );
