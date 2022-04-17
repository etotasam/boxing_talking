import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogoutBtn } from "@/components/LogoutBtn";
import { AuthIs } from "@/store/slice/authUserSlice";

//components
import { CustomLink } from "@/components/CustomLink";
import { LoginForm } from "@/components/LoginForm";

//hooks
import { useAuth } from "@/libs/hooks/useAuth";

type Props = {
  className?: string;
};

export const Header = React.memo(({ className }: Props) => {
  const { authState } = useAuth();
  const { pathname } = useLocation();
  const currentPage = pathname.split("/")[1];

  const userName = authState.hasAuth === AuthIs.TRUE ? authState.user.name : "ゲスト";

  return (
    <header className={`${className} w-full px-10 flex justify-between items-center bg-black`}>
      <h1 className="text-3xl text-white">Boxing Talking</h1>
      <div>
        {currentPage !== "" && (
          <CustomLink to="/" className="text-blue-400">
            Homeへ
          </CustomLink>
          // <Link className="text-blue-400" to="/">
          //   Homeへ
          // </Link>
        )}
      </div>
      <div className="relative">
        <p className="whitespace-nowrap absolute top-[-30px] right-0 text-right text-white">{`${userName}さん`}</p>
        <LoginOutComponent />
      </div>
    </header>
  );
});

const LoginOutComponent = () => {
  const { authState } = useAuth();
  return authState.hasAuth === AuthIs.TRUE ? <LogoutBtn /> : <LoginForm />;
};
