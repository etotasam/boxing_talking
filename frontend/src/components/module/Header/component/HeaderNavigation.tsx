import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/routePath';
import { useAdmin } from '@/hooks/apiHooks/auth';
import { AdministratorPageLinks } from '../../AdministratorPageLinks';

const LINK_STYLES = {
  common:
    'flex h-full items-center justify-center border-b-[3px] border-transparent px-8 text-[18px] font-bold duration-300 pc:block pc:h-auto pc:rounded-[50px] pc:border-b-0 pc:px-4 pc:py-1 pc:text-[14px] pc:font-normal',
  currentPage:
    'border-yellow-400 text-yellow-400 pointer-events-none pc:border-transparent pc:bg-yellow-400 pc:text-black',
  normalPage: 'text-white/70 hover:text-white pc:text-white pc:hover:bg-gray-500/50 pc:hover:scale-[110%]',
} as const;

const getLinkClassName = (targetPath: string, currentPath: string) =>
  clsx(
    LINK_STYLES.common,
    currentPath === targetPath ? LINK_STYLES.currentPage : LINK_STYLES.normalPage
  );

type HeaderNavigationProps = {
  pathname: string;
  showAdminLinks?: boolean;
};

export const HeaderNavigation = ({ pathname, showAdminLinks = true }: HeaderNavigationProps) => {
  const { isAdmin } = useAdmin();

  return (
    <nav className="flex h-full w-full pc:static pc:mb-4 pc:w-auto pc:items-end">
      <ul className="flex h-full w-full justify-center pc:w-auto pc:items-end">
        <li className="pc:ml-5">
          <Link className={getLinkClassName(ROUTE_PATH.HOME, pathname)} to={ROUTE_PATH.HOME}>
            Schedule
          </Link>
        </li>

        <li className="pc:ml-5">
          <Link
            className={getLinkClassName(ROUTE_PATH.PAST_MATCHES, pathname)}
            to={ROUTE_PATH.PAST_MATCHES}
          >
            Match Result
          </Link>
        </li>
      </ul>
      {showAdminLinks && isAdmin && <AdministratorPageLinks />}
    </nav>
  );
};
