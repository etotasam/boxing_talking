import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { AdminPageLinkIcon, AdminPageLinkList } from '@/components/module/AdminNavigation';

/** PC admin header の下段に常設する管理ページカード列。 */
export const PcAdminPageNavigation = () => {
  const { pathname } = useLocation();

  return (
    <nav aria-label="管理ページ" className="h-full">
      <AdminPageLinkList
        className="grid h-full w-full grid-cols-4"
        getItemClassName={() => 'h-full border-r border-white/20 last:border-r-0'}
        getLinkClassName={(link) =>
          clsx(
            'flex h-full w-full items-center justify-center gap-2 px-2 text-[clamp(12px,1.3vw,16px)] font-bold',
            'transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300',
            link.path === pathname
              ? 'bg-yellow-400 text-black'
              : 'bg-zinc-900 text-white/85 hover:bg-zinc-800 hover:text-white'
          )
        }
        renderLinkContent={(link) => (
          <>
            <AdminPageLinkIcon link={link} className="h-5 w-5 shrink-0" />
            <span>{link.name}</span>
          </>
        )}
      />
    </nav>
  );
};
