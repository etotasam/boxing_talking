import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/RoutePath';
import { Link } from 'react-router-dom';
// ! icons
import { FaUserEdit } from 'react-icons/fa';
import { RiEditBoxFill } from 'react-icons/ri';
import { RiUserAddLine } from 'react-icons/ri';
import { BsCalendarPlus } from 'react-icons/bs';
//! hook
import { useAdmin } from '@/hooks/apiHooks/useAuth';

const linksArray = [
  // { pathName: 'Home', path: ROUTE_PATH.HOME },
  { name: 'ボクサー登録', path: ROUTE_PATH.BOXER_REGISTER },
  { name: 'ボクサー編集', path: ROUTE_PATH.BOXER_EDIT },
  { name: '試合登録', path: ROUTE_PATH.MATCH_REGISTER },
  { name: '試合編集', path: ROUTE_PATH.MATCH_EDIT },
] as const;

export const AdministratorPageLinks = () => {
  const { pathname } = useLocation();
  const { isAdmin } = useAdmin();

  // 管理者ユーザーのときのみ表示
  if (!isAdmin) return;

  return (
    <ul className="flex ">
      {linksArray.map((link) => (
        <li key={`${link.name}_${link.path}`} className="md:ml-5 ml-2">
          <Link to={link.path}>
            <LinkButton pathname={pathname} link={link}>
              {link.name === 'ボクサー登録' && <RiUserAddLine />}
              {link.name === 'ボクサー編集' && <FaUserEdit />}
              {link.name === '試合登録' && <BsCalendarPlus />}
              {link.name === '試合編集' && <RiEditBoxFill />}
            </LinkButton>
          </Link>
        </li>
      ))}
    </ul>
  );
};

type LinkButtonPropsType = React.ComponentProps<'button'> & {
  pathname: string;
  link: { name: string; path: string };
};
const LinkButton = ({
  children,
  onMouseEnter,
  onMouseLeave,
  pathname,
  link,
}: LinkButtonPropsType) => {
  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx(
        'sm:w-[35px] sm:h-[35px] w-[30px] h-[30px] rounded-[50%] flex justify-center items-center text-[16px] duration-100',
        pathname === link.path
          ? 'bg-stone-300 text-stone-800'
          : 'bg-blue-600 text-white hover:text-[18px]'
      )}
    >
      {children}
    </button>
  );
};
