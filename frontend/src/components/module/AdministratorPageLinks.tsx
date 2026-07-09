import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaUserEdit } from 'react-icons/fa';
import { RiEditBoxFill } from 'react-icons/ri';
import { RiUserAddLine } from 'react-icons/ri';
import { BsCalendarPlus } from 'react-icons/bs';
import { ADMIN_PAGE_LINKS, AdminPageLink } from '@/constants/adminPageLinks';

const getAdminLinkIcon = (link: AdminPageLink) => {
  if (link.id === 'boxerRegister') return <RiUserAddLine />;
  if (link.id === 'boxerEdit') return <FaUserEdit />;
  if (link.id === 'matchRegister') return <BsCalendarPlus />;
  return <RiEditBoxFill />;
};

export const AdministratorPageLinks = () => {
  const { pathname } = useLocation();

  return (
    <ul className="ml-8 flex items-center gap-5">
      {ADMIN_PAGE_LINKS.map((link) => (
        <li key={`${link.name}_${link.path}`}>
          <Link
            to={link.path}
            aria-label={link.name}
            className={getLinkClassName(pathname, link)}
          >
            {getAdminLinkIcon(link)}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const getLinkClassName = (pathname: string, link: AdminPageLink) => {
  return clsx(
    'flex h-10 w-10 items-center justify-center rounded-full border text-[20px] duration-100',
    pathname === link.path
      ? 'border-yellow-400 bg-yellow-400 text-black'
      : 'border-blue-500 text-blue-500 hover:bg-blue-500/20 hover:text-blue-300'
  );
};
