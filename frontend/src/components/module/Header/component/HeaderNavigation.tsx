import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/routePath';
import { useAdmin } from '@/hooks/apiHooks/useAuth';
import { AdministratorPageLinks } from '../../AdministratorPageLinks';

const LINK_STYLES = {
  common: 'text-[14px] duration-300 px-4 py-1 rounded-[50px]',
  currentPage: 'text-black bg-yellow-400 pointer-events-none',
  normalPage: 'text-white hover:bg-gray-500/50 hover:scale-[110%]',
} as const;

const getLinkClassName = (targetPath: string, currentPath: string) =>
  clsx(
    LINK_STYLES.common,
    currentPath === targetPath ? LINK_STYLES.currentPage : LINK_STYLES.normalPage
  );

type HeaderNavigationProps = {
  pathname: string;
};

export const HeaderNavigation = ({ pathname }: HeaderNavigationProps) => {
  const { isAdmin } = useAdmin();

  return (
    <nav className="absolute bottom-2 pc:static flex pc:items-end pc:mb-4">
      <ul className="flex pc:items-end">
        <li className="pc:ml-5 ml-2">
          <Link className={getLinkClassName(ROUTE_PATH.HOME, pathname)} to={ROUTE_PATH.HOME}>
            Schedule
          </Link>
        </li>

        <li className="pc:ml-5 ml-2">
          <Link
            className={getLinkClassName(ROUTE_PATH.PAST_MATCHES, pathname)}
            to={ROUTE_PATH.PAST_MATCHES}
          >
            Match Result
          </Link>
        </li>
      </ul>
      {isAdmin && <AdministratorPageLinks />}
    </nav>
  );
};
