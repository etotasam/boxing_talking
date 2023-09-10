import React from "react";
// ! modules
import { Button } from "@/components/atomc/Button";
import { DivVerticalCenter } from "@/components/atomc/DivVerticalCenter";
// ! recoil
import { useSetRecoilState } from "recoil";
import { formTypeSelector, FORM_TYPE } from "@/store/formTypeState";
import { loginModalSelector } from "@/store/loginModalState";
// ! types
import { UserType } from "@/assets/types";
// ! hooks
import { useLogout } from "@/hooks/useAuth";
// import { useAuth } from "@/hooks/useAuth";
// ! icons
import { IconContext } from "react-icons";
import { BiUserCircle } from "react-icons/bi";
//! component
import { LinkList } from "../LinkList";
import { useAdmin } from "@/hooks/useAuth";

type PropsType = {
  userData: UserType | undefined;
};

export const Header = (porps: PropsType) => {
  const { userData } = porps;
  const { isAdmin } = useAdmin();

  const setFormType = useSetRecoilState(formTypeSelector);

  // ! loginモーダルの表示のOn/Offメソッド
  const setLoginModalState = useSetRecoilState(loginModalSelector);
  const openLoginForm = () => {
    setFormType(FORM_TYPE.LOGIN_FORM);
    setLoginModalState(true);
  };

  const { logout } = useLogout();

  return (
    <>
      <header className="h-[80px] felx relative after:w-full after:absolute after:bottom-[-3px] after:left-0 after:h-[3px] after:bg-red-500">
        {/* <DivVerticalCenter> */}
        <h1 className="text-[64px] font-thin">BOXING TALKING</h1>
        {/* </DivVerticalCenter> */}
        {isAdmin && (
          <div className="absolute right-[200px] top-0">
            <LinkList />
          </div>
        )}
        {/* <LinkList /> */}
        {/* <DivVerticalCenter className="absolute right-[50px] top-0"> */}

        {userData && (
          <div className="absolute top-0 right-[30px] flex">
            <IconContext.Provider value={{ color: "#1e1e1e", size: "25px" }}>
              <span className="mr-1">
                <BiUserCircle />
              </span>
            </IconContext.Provider>
            {userData.name}
          </div>
        )}
        <AuthControlComponent
          userData={userData}
          logout={logout}
          openLoginForm={openLoginForm}
        />
        {/* </DivVerticalCenter> */}
      </header>
    </>
  );
};

type AuthControlComponentPropsType = {
  userData: UserType | undefined;
  logout: ({ userId }: { userId: string }) => void;
  openLoginForm: () => void;
};
// ! ログイン/ログアウトのボタン
const AuthControlComponent = ({
  userData,
  logout,
  openLoginForm,
}: AuthControlComponentPropsType) => {
  return (
    <>
      <div className="absolute top-0 right-0 w-[200px] h-full flex justify-center">
        <div className="absolute bottom-3 flex justify-center">
          {userData ? (
            <Button onClick={() => logout({ userId: userData.id! })}>
              ログアウト
            </Button>
          ) : (
            <Button onClick={() => openLoginForm()}>ログイン</Button>
          )}
        </div>
      </div>
    </>
  );
};
