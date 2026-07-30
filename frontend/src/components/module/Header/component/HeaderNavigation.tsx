import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { COMMON_PAGE_LINKS } from '@/constants/commonPageLinks';

const LINK_STYLES = {
  common:
    'flex h-full items-center justify-center whitespace-nowrap border-b-[3px] border-transparent px-8 text-[18px] font-bold duration-300 pc:px-[clamp(8px,1.5vw,16px)] pc:text-[clamp(15px,1.8vw,18px)]',
  currentPage:
    'border-yellow-400 text-yellow-400 pointer-events-none',
  normalPage: 'text-white/70 hover:text-white',
} as const;

const getLinkClassName = (targetPath: string, currentPath: string) =>
  clsx(
    LINK_STYLES.common,
    currentPath === targetPath ? LINK_STYLES.currentPage : LINK_STYLES.normalPage
  );

type HeaderNavigationProps = { pathname: string };

export const HeaderNavigation = ({ pathname }: HeaderNavigationProps) => {
  return (
    <nav className="flex h-full w-full pc:ml-[clamp(12px,4vw,48px)] pc:w-auto pc:shrink-0 pc:items-center">
      <ul className="flex h-full w-full justify-center pc:w-auto">
        {COMMON_PAGE_LINKS.map((link, index) => (
          <li key={link.id} className={index === 0 ? 'pc:ml-0' : 'pc:ml-[clamp(8px,2vw,20px)]'}>
            <Link className={getLinkClassName(link.path, pathname)} to={link.path}>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
