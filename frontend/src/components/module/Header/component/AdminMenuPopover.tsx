import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { IoChevronForwardOutline } from 'react-icons/io5';
import { useLocation } from 'react-router-dom';
import { AdminPageLink } from '@/constants/adminPageLinks';
import {
  AdminMenuButton,
  AdminPageLinkIcon,
  AdminPageLinkList,
} from '@/components/module/AdminNavigation';

const ADMIN_PAGE_LINKS_ID = 'pc-admin-page-links';

const panelVariants: Variants = {
  initial: { clipPath: 'inset(0 0 100% 0)' },
  open: { clipPath: 'inset(0 0 0 0)', transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.15, ease: 'easeIn' } },
};

const linkListVariants: Variants = {
  initial: {},
  open: { transition: { staggerChildren: 0.05 } },
};

const linkItemVariants: Variants = {
  initial: { y: -12 },
  open: { y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
};

/** PCヘッダーで表示する管理ページリンクのポップオーバー。 */
export const AdminMenuPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuFrameRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const menuFrame = menuFrameRef.current;
    if (!menuFrame) return;

    if (isOpen) {
      menuFrame.removeAttribute('inert');
      return;
    }

    menuFrame.setAttribute('inert', '');
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

      <div
        ref={menuFrameRef}
        aria-hidden={!isOpen}
        className={clsx(
          'absolute right-6 top-full z-20 w-[260px] overflow-hidden rounded-b-md',
          !isOpen && 'pointer-events-none'
        )}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="initial"
              animate="open"
              exit="exit"
              variants={panelVariants}
              className="border border-white/20 bg-zinc-950 shadow-xl"
              data-testid="pc-admin-menu-popover"
              id={ADMIN_PAGE_LINKS_ID}
            >
              <AdminPageLinkList
                className="divide-y divide-white/15"
                getLinkClassName={(link) => getLinkClassName(link, pathname)}
                listVariants={linkListVariants}
                itemVariants={linkItemVariants}
                renderLinkContent={(link) => (
                  <>
                    <AdminPageLinkIcon link={link} />
                    <span className="ml-4 flex-1 text-left">{link.name}</span>
                    <IoChevronForwardOutline className="h-5 w-5 text-white/60" aria-hidden="true" />
                  </>
                )}
                onNavigate={close}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const getLinkClassName = (link: AdminPageLink, pathname: string) =>
  clsx(
    'flex min-h-14 items-center px-5 text-[15px] font-bold text-white/85 transition-colors',
    'hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white',
    link.path === pathname && 'bg-white/10 text-white'
  );
