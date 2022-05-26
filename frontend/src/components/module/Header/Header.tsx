import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogoutBtn } from "@/components/module/LogoutBtn";
import { WINDOW_WIDTH } from "@/libs/utils";
//! components
import { Button } from "@/components/atomic/Button";
import { CustomLink } from "@/components/module/CustomLink";
import { LoginForm } from "@/components/module/LoginForm";

//! hooks
// import { useAuth } from "@/libs/hooks/useAuth";
import { useAuth } from "@/libs/hooks/useAuth";
import { useQueryState } from "@/libs/hooks/useQueryState";
import { useGetWindowWidth } from "@/libs/hooks/useGetWindowWidth";

type Props = {
  className?: string;
};

export const Header = ({ className }: Props) => {
  const { pathname } = useLocation();
  const currentPage = pathname.split("/")[1];

  return (
    <header className={`${className} flex justify-start items-center px-5 bg-stone-900`}>
      <div className="grid grid-rows-1 grid-cols-[150px_1fr_120px] lg:grid-cols-[250px_1fr_500px] w-full">
        <h1 className="text-3xl text-white col-span-1">BOXING TALKING</h1>
        <div className="col-span-1 flex justify-start items-end">
          {currentPage !== "" && (
            <CustomLink to="/" className="text-white">
              Home
            </CustomLink>
          )}
        </div>
        <div className="flex items-center justify-end">
          <AuthControlComponent />
        </div>
      </div>
    </header>
  );
};

const AuthControlComponent = () => {
  const { data: authState } = useAuth();
  //? openSignUpModalの状態管理
  const { setter: setIsOpenSignUpModal } = useQueryState<boolean>("q/isOpenSignUpModal", false);
  const openSignUpModal = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setIsOpenSignUpModal(true);
  };

  const userName = authState ? authState.name : process.env.REACT_APP_GUEST_NAME;

  const windowWidth = useGetWindowWidth();

  //? loginモーダルの状態管理
  const { setter: setIsOpenLoginModal } = useQueryState<boolean>("q/isOpenLoginModal");
  return (
    <>
      {/* {windowWidth > WINDOW_WIDTH.lg ? ( */}
      <div className="relative col-span-1 flex items-center justify-end">
        <p className="whitespace-nowrap absolute top-[-30px] right-0 text-right text-white">{`${userName}さん`}</p>
        {windowWidth > WINDOW_WIDTH.lg ? (
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
          <>
            {authState ? (
              <LogoutBtn />
            ) : (
              <div>
                <Button onClick={() => setIsOpenLoginModal(true)}>ログイン</Button>
              </div>
            )}
          </>
        )}
        {/* <Notice /> */}
      </div>
    </>
  );
};

const LoginOutComponent = () => {
  const { data: authState } = useAuth();
  return authState ? <LogoutBtn /> : <LoginForm />;
};
