import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { IoChevronDownOutline } from 'react-icons/io5';
import { Link, useLocation } from 'react-router-dom';
import { COMMON_PAGE_LINKS } from '@/constants/commonPageLinks';

const COMMON_PAGE_LINKS_ID = 'sp-common-page-links';

const panelVariants: Variants = {
  initial: { clipPath: 'inset(0 0 100% 0)' },
  open: { clipPath: 'inset(0 0 0 0)', transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.15, ease: 'easeIn' } },
};

/** SP admin header の下段から共通ページを展開するアコーディオン。 */
export const SpCommonMenuPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuFrameRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
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
      <button
        ref={triggerRef}
        type="button"
        aria-label="一般ページを開閉"
        aria-controls={COMMON_PAGE_LINKS_ID}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={clsx(
          'flex h-full min-h-14 w-full min-w-14 flex-col items-center justify-center gap-0.5 px-1',
          'text-[clamp(9px,2.7vw,12px)] font-bold leading-tight text-white/85 transition-colors',
          'hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300'
        )}
      >
        <IoChevronDownOutline
          className={clsx('h-5 w-5 transition-transform', isOpen && 'rotate-180')}
        />
        <span className="whitespace-nowrap">一般ページ</span>
      </button>

      <div
        ref={menuFrameRef}
        aria-hidden={!isOpen}
        className={clsx(
          'absolute left-0 top-full z-20 w-full overflow-hidden',
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
              className="border-b border-white/20 bg-zinc-950 shadow-xl"
              data-testid="sp-common-menu-popover"
              id={COMMON_PAGE_LINKS_ID}
            >
              <ul className="divide-y divide-white/15">
                {COMMON_PAGE_LINKS.map((link) => (
                  <li key={link.id}>
                    <Link
                      to={link.path}
                      aria-current={pathname === link.path ? 'page' : undefined}
                      onClick={close}
                      className="flex min-h-14 items-center px-5 text-[15px] font-bold text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
