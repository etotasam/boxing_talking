import { ROUTE_PATH } from '@/constants/routePath';
import { ADMIN_PAGE_LINKS } from '@/constants/adminPageLinks';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMenuModal } from '@/hooks/useMenuModal';
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { deviceState } from '@/store/deviceState';
import { useEffect } from 'react';
import { useAdmin } from '@/hooks/apiHooks/auth';

export const MenuModal = () => {
  const { state: isShow, hide: hideMenuModal } = useMenuModal();
  const device = useRecoilValue(deviceState);

  useEffect(() => {
    if (device === 'PC') {
      hideMenuModal();
    }
  }, [device]);

  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          initial={{ y: '-100vh', opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100vh', opacity: 1, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ height: `calc(100vh - ${0}px)` }}
          className="bg-red-600 w-full z-10 fixed top-0 flex justify-center text-white"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="w-full"
          >
            <Content />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Content = () => {
  const { hide: hideMenuModal } = useMenuModal();
  const { isAdmin } = useAdmin();

  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const LinkList: { text: string; engText: string; link: string }[] = [
    { text: '試合一覧', engText: 'matches', link: ROUTE_PATH.HOME },
    { text: '過去試合一覧', engText: 'past matches', link: ROUTE_PATH.PAST_MATCHES },
  ];
  return (
    <div style={{ marginTop: `${headerHeight}px` }} className="pl-10 pt-10">
      <ul className="mb-8">
        {LinkList.map((el) => (
          <li key={el.text} className="tracking-[5px] text-sm mb-5 last-of-type:mb-0">
            <Link to={el.link} onClick={hideMenuModal}>
              {el.text}/<span className="text-xs tracking-[1px]">{el.engText}</span>
            </Link>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <ul>
          {ADMIN_PAGE_LINKS.map((link) => (
            <li key={link.id} className="tracking-[5px] text-sm mb-5 last-of-type:mb-0">
              <Link to={link.path} onClick={hideMenuModal}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
