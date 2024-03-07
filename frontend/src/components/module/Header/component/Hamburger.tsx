import React, { useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';

//!recoil
import { useRecoilState } from 'recoil';
import { modalState } from '@/store/modalState';

export const Hamburger = React.memo(() => {
  const { pathname } = useLocation();
  const hamburgerTopControls = useAnimationControls();
  const hamburgerBottomControls = useAnimationControls();

  const [isShowMenuModal, setIsShowMenuModal] = useRecoilState(modalState('MENU'));

  //? ページ遷移時（再描画）にハンバーガーのアニメーションを制御する為に使用
  const [isHamburgerOpen, setsHamburgerOpen] = useRecoilState(modalState('MENU_OPEN_BUTTON_STATE'));

  //? アニメーション読み込み中にクリックされるのを防ぐ為に使用
  const [isAnimeInProcess, setIsAnimeInProcess] = useState(false);

  const toBeforeHamburger = async () => {
    if (!isHamburgerOpen) return;
    const top = hamburgerTopControls
      .start({ rotate: 0, top: '50%', transition: { duration: 0.2 } })
      .then(() => {
        hamburgerTopControls.start({ rotate: 0, top: 0, transition: { duration: 0.2 } });
      });

    const bottom = hamburgerBottomControls.start({
      rotate: 0,
      top: '50%',
      transition: { duration: 0.2 },
    });
    setIsAnimeInProcess(true);
    await Promise.all([top, bottom]);
    setIsAnimeInProcess(false);
    setsHamburgerOpen(false);
  };

  const toAfterHamburger = async () => {
    const top = hamburgerTopControls.start({ top: '50%' }).then(() => {
      hamburgerTopControls.start({ rotate: '55deg' });
    });

    const bottom = hamburgerBottomControls.start({ top: '50%' }).then(() => {
      hamburgerBottomControls.start({ rotate: '-55deg' });
    });

    setIsAnimeInProcess(true);
    await Promise.all([top, bottom]);
    setIsAnimeInProcess(false);
    setsHamburgerOpen(true);
  };

  useEffect(() => {
    setIsShowMenuModal(false);
  }, [pathname]);

  useEffect(() => {
    (async () => {
      if (isShowMenuModal) return await toAfterHamburger();
      await toBeforeHamburger();
    })();
  }, [isShowMenuModal]);

  const onClick = () => {
    if (isAnimeInProcess) return;
    setIsShowMenuModal((v) => !v);
  };

  return (
    <div onClick={onClick} className="absolute bottom-2 left-[50%] translate-x-[-50%]">
      <div className="relative w-5 h-5">
        <motion.span
          animate={hamburgerTopControls}
          initial={isShowMenuModal ? { rotate: '55deg', top: '50%' } : { rotate: 0, top: 0 }}
          transition={{ duration: 0.4 }}
          className={clsx('absolute w-5 h-[2px] bg-white')}
        />
        <motion.span
          animate={hamburgerBottomControls}
          initial={isShowMenuModal ? { rotate: '-55deg', top: '50%' } : { rotate: 0, top: '50%' }}
          transition={{ duration: 0.4 }}
          className={clsx('absolute w-5 h-[2px] bg-white')}
        />
      </div>
    </div>
  );
});
