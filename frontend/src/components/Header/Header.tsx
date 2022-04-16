import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogoutBtn } from "@/components/LogoutBtn";
import { AuthIs } from "@/store/slice/authUserSlice";

//components
import { CustomLink } from "@/components/CustomLink";

//hooks
import { useAuth } from "@/libs/hooks/useAuth";
import Button from "../Button";

type Props = {
  className?: string;
};

export const Header = React.memo(({ className }: Props) => {
  const { authState } = useAuth();
  const { pathname } = useLocation();
  const currentPage = pathname.split("/")[1];

  const userName = authState.hasAuth === AuthIs.TRUE ? authState.user.name : "ゲスト";

  return (
    <header className={className}>
      <div className="flex">
        <h1>header</h1>
        <p>{`${userName}さん`}</p>
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
        <SignInOutBtn />
      </div>
    </header>
  );
});

const SignInOutBtn = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  return authState.hasAuth === AuthIs.TRUE ? (
    <LogoutBtn />
  ) : (
    <Button onClick={() => navigate("/login")}>Loginへ</Button>
  );
};
