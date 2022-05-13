import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogoutBtn } from "@/components/module/LogoutBtn";
import { AuthIs } from "@/store/slice/authUserSlice";

//components
import { CustomLink } from "@/components/module/CustomLink";
import { LoginForm } from "@/components/module/LoginForm";

//! hooks
// import { useAuth } from "@/libs/hooks/useAuth";
import { useAuth } from "@/libs/hooks/useAuth";

type Props = {
  className?: string;
};

export const Header = ({ className }: Props) => {
  // const { authState } = useAuth();
  const { data: authState } = useAuth();
  const { pathname } = useLocation();
  const currentPage = pathname.split("/")[1];

  const userName = authState ? authState.name : "ゲスト";

  return (
    <header className={`${className} flex justify-center items-center px-10 bg-stone-900`}>
      <div className="grid grid-rows-1 grid-cols-[250px_1fr_500px] w-full">
        <h1 className="text-3xl text-white w-[250px] col-span-1">BOXING TALKING</h1>
        <div className="col-span-1 pl-5 flex items-end">
          {currentPage !== "" && (
            <CustomLink to="/" className="text-white">
              Home
            </CustomLink>
          )}
        </div>
        <div className="relative col-span-1 flex items-center justify-end">
          <p className="whitespace-nowrap absolute top-[-30px] right-0 text-right text-white">{`${userName}さん`}</p>
          <LoginOutComponent />
          {/* <Notice /> */}
        </div>
      </div>
    </header>
  );
};

const LoginOutComponent = () => {
  const { data: authState } = useAuth();
  return authState ? <LogoutBtn /> : <LoginForm />;
};
