import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { AdminPageLinkIcon, AdminPageLinkList } from '@/components/module/AdminNavigation';

/** SP admin header の下段に常設する4件の管理ページリンク。 */
export const SpAdminPageNavigation = () => {
  const { pathname } = useLocation();

  return (
    <nav aria-label="管理ページ" className="h-full w-full">
      <AdminPageLinkList
        className="grid h-full w-full grid-cols-4"
        getItemClassName={() => 'min-w-0 border-r border-white/15 last:border-r-0'}
        getLinkClassName={(link) =>
          clsx(
            'flex h-full min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5',
            'text-[clamp(9px,2.7vw,12px)] font-bold leading-tight transition-colors',
            'focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300',
            link.path === pathname
              ? 'bg-yellow-400 text-black'
              : 'text-white/85 hover:bg-white/10 hover:text-white'
          )
        }
        renderLinkContent={(link) => (
          <>
            <AdminPageLinkIcon link={link} className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap">{link.name}</span>
          </>
        )}
      />
    </nav>
  );
};
