import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { AiOutlineUser } from 'react-icons/ai';
import { IoChevronDownOutline, IoLogOutOutline } from 'react-icons/io5';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isPcState } from '@/store/isPcState';
import { useHeaderAuthInfo } from '../hooks/useHeaderAuthInfo';

export const HeaderAuthInfo = () => {
  const isPc = useRecoilValue(isPcState);
  const authInfo = useHeaderAuthInfo();
  const { pathname } = useLocation();

  if (!authInfo) return null;

  return (
    <HeaderAuthInfoView
      key={JSON.stringify([pathname, isPc, authInfo.userName])}
      {...authInfo}
      isPc={isPc}
    />
  );
};

type HeaderAuthInfoViewProps = {
  isPc: boolean;
  userName: string;
  onLogout: () => void;
};

export const HeaderAuthInfoView = ({
  isPc,
  userName,
  onLogout,
}: HeaderAuthInfoViewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        triggerRef.current?.focus();
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    if (containerRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    setIsOpen(false);
    onLogout();
  };

  return (
    <div
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      className="relative z-30 min-w-0 max-w-[128px] pc:max-w-[220px]"
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={userName ? `${userName}のユーザーメニュー` : 'ユーザーメニュー'}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        className={clsx(
          'flex min-h-11 w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-md text-white/80 transition-colors',
          'hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
          isPc ? 'text-sm' : 'text-[11px]',
          isOpen && 'bg-white/5 text-white'
        )}
      >
        <AiOutlineUser
          aria-hidden="true"
          className="h-7 w-7 shrink-0 rounded-full border border-white/20 bg-stone-500 p-1.5 text-white pc:h-8 pc:w-8"
        />
        <span className="min-w-0 truncate">{userName}</span>
        <IoChevronDownOutline
          aria-hidden="true"
          className={clsx('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div
          id={panelId}
          className="absolute right-0 top-full mt-2 w-[180px] rounded-md border border-white/25 bg-[#1B1D20] p-1 shadow-lg"
        >
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded px-3 text-left text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white"
          >
            <IoLogOutOutline aria-hidden="true" className="h-5 w-5 shrink-0" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
};
