import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { BsCalendarPlus } from 'react-icons/bs';
import { FaUserEdit } from 'react-icons/fa';
import { RiEditBoxFill, RiUserAddLine } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import { ADMIN_PAGE_LINKS, AdminPageLink } from '@/constants/adminPageLinks';
import { useAdmin } from '@/hooks/apiHooks/auth';

type AdminMenuButtonProps = {
  controlsId: string;
  isOpen: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

/** 管理リンクパネルを開閉するための共通ボタン。 */
export const AdminMenuButton = ({
  controlsId,
  isOpen,
  onClick,
  children,
  className,
}: AdminMenuButtonProps) => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <button
      type="button"
      aria-label="管理メニューを開閉"
      aria-controls={controlsId}
      aria-expanded={isOpen}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
};

type AdminPageLinkListProps = {
  id?: string;
  className?: string;
  getItemClassName?: (link: AdminPageLink) => string | undefined;
  getLinkClassName?: (link: AdminPageLink) => string | undefined;
  renderLinkContent?: (link: AdminPageLink) => ReactNode;
  onNavigate?: () => void;
  listVariants?: Variants;
  itemVariants?: Variants;
};

/** 管理ページごとのリンクアイコン。 */
export const AdminPageLinkIcon = ({ link }: { link: AdminPageLink }) => {
  if (link.id === 'boxerRegister') return <RiUserAddLine />;
  if (link.id === 'boxerEdit') return <FaUserEdit />;
  if (link.id === 'matchRegister') return <BsCalendarPlus />;
  return <RiEditBoxFill />;
};

/** 管理者だけに表示する管理ページへの標準リンクリスト。 */
export const AdminPageLinkList = ({
  id,
  className,
  getItemClassName,
  getLinkClassName,
  renderLinkContent,
  onNavigate,
  listVariants,
  itemVariants,
}: AdminPageLinkListProps) => {
  const { isAdmin } = useAdmin();
  const { pathname } = useLocation();

  if (!isAdmin) return null;

  const links = ADMIN_PAGE_LINKS.map((link) => {
    const content = (
      <Link
        to={link.path}
        aria-label={link.name}
        aria-current={pathname === link.path ? 'page' : undefined}
        className={getLinkClassName?.(link)}
        onClick={onNavigate}
      >
        {renderLinkContent?.(link) ?? link.name}
      </Link>
    );

    if (itemVariants) {
      return (
        <motion.li key={link.id} className={getItemClassName?.(link)} variants={itemVariants}>
          {content}
        </motion.li>
      );
    }

    return (
      <li key={link.id} className={getItemClassName?.(link)}>
        {content}
      </li>
    );
  });

  if (listVariants) {
    return (
      <motion.ul id={id} className={className} variants={listVariants}>
        {links}
      </motion.ul>
    );
  }

  return <ul id={id} className={className}>{links}</ul>;
};
