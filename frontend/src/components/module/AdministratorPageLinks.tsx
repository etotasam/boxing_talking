import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaUserEdit } from 'react-icons/fa';
import { RiEditBoxFill } from 'react-icons/ri';
import { RiUserAddLine } from 'react-icons/ri';
import { BsCalendarPlus } from 'react-icons/bs';
import { ADMIN_PAGE_LINKS, AdminPageLink } from '@/constants/adminPageLinks';

export const AdministratorPageLinks = () => {
  const { pathname } = useLocation();

  return (
    <ul className="flex ">
      {ADMIN_PAGE_LINKS.map((link) => (
        <li key={`${link.name}_${link.path}`} className="pc:ml-5 ml-2">
          <Link to={link.path}>
            <LinkButton pathname={pathname} link={link}>
              {link.id === 'boxerRegister' && <RiUserAddLine />}
              {link.id === 'boxerEdit' && <FaUserEdit />}
              {link.id === 'matchRegister' && <BsCalendarPlus />}
              {link.id === 'matchEdit' && <RiEditBoxFill />}
            </LinkButton>
          </Link>
        </li>
      ))}
    </ul>
  );
};

type LinkButtonPropsType = React.ComponentProps<'button'> & {
  pathname: string;
  link: AdminPageLink;
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
        'sm:w-[40px] sm:h-[40px] w-[30px] h-[30px] rounded-[50%] flex justify-center items-center text-[16px] duration-100',
        pathname === link.path
          ? 'bg-stone-300 text-stone-800'
          : 'bg-blue-600 text-white hover:text-[18px]'
      )}
    >
      {children}
    </button>
  );
};
