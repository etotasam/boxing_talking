import { ROUTE_PATH } from '@/assets/routePath';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
//! hook
import { useMenuModal } from '@/hooks/useMenuModal';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! icon
import { IoLogOutSharp } from 'react-icons/io5';

export const MenuModal = () => {
  const { state: isShow } = useMenuModal();

  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          initial={{ y: '-100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100vh', opacity: 1, transition: { duration: 0.2 } }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: `calc(100vh - ${0}px)` }}
          className="bg-neutral-900 w-full z-10 fixed top-0 flex justify-center text-white"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.5, delay: 0.7 }}
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

  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const LinkList: { text: string; engText: string; link: string }[] = [
    { text: '試合一覧', engText: 'matches', link: ROUTE_PATH.HOME },
    { text: '過去試合一覧', engText: 'past matches', link: ROUTE_PATH.PAST_MATCHES },
  ];
  return (
    <div style={{ marginTop: `${headerHeight}px` }} className="pl-10 pt-10">
      <ul>
        {LinkList.map((el) => (
          <li key={el.text} className="tracking-[5px] text-sm mb-5 last-of-type:mb-0">
            <Link to={el.link} onClick={hideMenuModal}>
              {el.text}/<span className="text-xs tracking-[1px]">{el.engText}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LogoutIcon = () => {
  return (
    <button className="fixed top-[40px] right-0 flex items-center text-xs px-[3px] py-[2px] bg-neutral-800 text-neutral-500">
      <IoLogOutSharp className={'text-xl mr-1'} />
      ログアウト
    </button>
  );
};
