import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogoutBtn } from "@/components/module/LogoutBtn";
import { WINDOW_WIDTH } from "@/libs/utils";
import { motion, useAnimation, AnimationControls, AnimatePresence } from "framer-motion";
//! components
import { CustomLink } from "@/components/module/CustomLink";
import { LoginForm } from "@/components/module/LoginForm";
import { Hamburger } from "@/components/module/Hamburger";
//! hooks
// import { useAuth } from "@/libs/hooks/useAuth";
import { useAuth } from "@/libs/hooks/useAuth";
import { useQueryState } from "@/libs/hooks/useQueryState";
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";

type Props = {
  className?: string;
};

export const Header = React.memo(({ className }: Props) => {
  const { pathname } = useLocation();
  const currentPage = pathname.split("/")[1];

  const { state: isOpenHamburgerMenu, setter: setIsOpenHamburgerMenu } =
    useQueryState<boolean>("q/isOpenHamburgerMenu");

  const { width: windowWidth } = useGetWindowSize();

  //? window widthが md より大きくなったらhamburger menu modal は閉じる
  useEffect(() => {
    if (windowWidth >= WINDOW_WIDTH.md) {
      setIsOpenHamburgerMenu(false);
    }
  }, [windowWidth]);

  const headerControls: AnimationControls = useAnimation();
  const hamburgerControls: AnimationControls = useAnimation();
  const h1Controls: AnimationControls = useAnimation();

  useEffect(() => {
    if (isOpenHamburgerMenu) {
      window.scroll({ top: 0, behavior: "smooth" });
    }
    startAnimate();
    scrollLockOnBody();
  }, [isOpenHamburgerMenu]);

  const scrollLockOnBody = () => {
    if (isOpenHamburgerMenu) {
      document.body.style.overflowY = "hidden";
      return;
    }
    if (!isOpenHamburgerMenu) {
      document.body.style.overflowY = "scroll";
      return;
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  const startAnimate = () => {
    if (isOpenHamburgerMenu) {
      hamburgerControls.start(() => {
        return {
          zIndex: 999,
          position: "fixed",
          // top: "40px",
          // right: "20px",
        };
      });
      headerControls.start(() => {
        return {
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100%",
          zIndex: 30,
          transition: { duration: 0.3 },
        };
      });
      h1Controls.start(() => {
        return {
          bottom: "15px",
          transition: { duration: 0.3 },
        };
      });
    }
    if (!isOpenHamburgerMenu) {
      hamburgerControls.start(() => {
        return {
          transition: { duration: 0.3 },
          transitionEnd: {
            position: "absolute",
          },
        };
      });
      headerControls.start(() => {
        return {
          height: "100px",
          width: "100%",
          transition: { duration: 0.3 },
          transitionEnd: {
            position: "absolute",
            top: 0,
            left: 0,
          },
        };
      });
      h1Controls.start(() => {
        return {
          transition: { duration: 0.3 },
        };
      });
    }
  };

  return (
    <>
      <motion.header animate={headerControls} className={`bg-stone-900`}>
        <div className="relative h-[100px] max-w-[1024px] lg:mx-auto">
          <motion.h1
            animate={h1Controls}
            className="w-[150px] absolute left-[8px] md:left-[20px] lg:left-0 bottom-[15px] text-3xl text-white"
          >
            BOXING TALKING
          </motion.h1>
          {windowWidth >= WINDOW_WIDTH.md && currentPage !== "" && (
            <div className="text-white absolute bottom-[15px] left-[170px]">
              <CustomLink to="/" className="">
                Home
              </CustomLink>
            </div>
          )}
          <motion.div
            animate={hamburgerControls}
            className="absolute top-[40px] right-[8px] md:right-[20px] lg:right-0"
          >
            <AuthControlComponent />
          </motion.div>
          <AnimatePresence>{isOpenHamburgerMenu && <ModalMenu />}</AnimatePresence>
        </div>
      </motion.header>
    </>
  );
});

const AuthControlComponent = () => {
  const { data: authState } = useAuth();
  //? openSignUpModalの状態管理
  const { setter: setIsOpenSignUpModal } = useQueryState<boolean>("q/isOpenSignUpModal", false);
  const openSignUpModal = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setIsOpenSignUpModal(true);
  };

  const userName = authState ? authState.name : process.env.REACT_APP_GUEST_NAME;

  const { width: windowWidth } = useGetWindowSize();

  //? loginモーダルの状態管理
  // const { setter: setIsOpenLoginModal } = useQueryState<boolean>("q/isOpenLoginModal");
  return (
    <>
      {/* {windowWidth > WINDOW_WIDTH.lg ? ( */}
      <div className="relative col-span-1 flex items-center justify-end">
        <p className="whitespace-nowrap absolute top-[-30px] right-0 text-right font-extralight text-sm md:text-base text-white">{`${userName}さん`}</p>
        {windowWidth > WINDOW_WIDTH.md ? (
          <>
            <LoginOutComponent />
            {!authState && (
              <Link
                to={"#"}
                onClick={openSignUpModal}
                className={`absolute bottom-[-25px] text-[13px] right-0 h-[20px] text-green-600 box-border hover:border-green-600 hover:border-b`}
              >
                アカウント作成
              </Link>
            )}
          </>
        ) : (
          <Hamburger />
        )}
      </div>
    </>
  );
};

const LoginOutComponent = () => {
  const { data: authState } = useAuth();
  return authState ? <LogoutBtn /> : <LoginForm />;
};

const ModalMenu = React.memo(() => {
  const { pathname } = useLocation();
  const currentPage = pathname.split("/")[1];

  const { data: authState } = useAuth();
  const navigate = useNavigate();
  const { setter: setIsOpenHamburgerMenu } = useQueryState<boolean>("q/isOpenHamburgerMenu");
  const vatiant = {
    initial: {
      y: "-100vh",
      zIndex: 50,
    },
    show: {
      y: 0,
      transition: { duration: 0.3 },
    },
    hidden: {
      y: "-100vh",
      transition: { duration: 0.3 },
    },
  };

  useEffect(() => {
    return () => {
      setIsOpenHamburgerMenu(false);
      setIsOpenLoginModal(false);
    };
  }, []);

  const onclick = React.useCallback((e) => {
    e.preventDefault();
    setIsOpenHamburgerMenu(false);
    navigate("/");
  }, []);

  //? loginモーダルの状態管理
  const { setter: setIsOpenLoginModal } = useQueryState<boolean>("q/isOpenLoginModal");

  return (
    <motion.div
      initial="initial"
      exit="hidden"
      animate="show"
      // animate={modalControls}
      variants={vatiant}
      className="absolute top-0 left-0 w-full h-[100vh] flex justify-center items-center"
    >
      <div className="flex flex-col last:border-2 border-white text-white p-10">
        {currentPage !== "" && (
          <CustomLink onClick={(e: any) => onclick(e)} className="text-white text-center">
            Home
          </CustomLink>
        )}
        <div className="mt-5">
          {authState ? <LogoutBtn /> : <p onClick={() => setIsOpenLoginModal(true)}>ろぐいん</p>}
        </div>
      </div>
    </motion.div>
  );
});
