import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { AdminPageLink } from '@/constants/adminPageLinks';
import { AdminPageLinkIcon, AdminPageLinkList } from './AdminNavigation';

export const AdministratorPageLinks = () => {
  const { pathname } = useLocation();

  return (
    <AdminPageLinkList
      className="ml-8 flex items-center gap-5"
      getLinkClassName={(link) => getLinkClassName(pathname, link)}
      renderLinkContent={(link) => <AdminPageLinkIcon link={link} />}
    />
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
