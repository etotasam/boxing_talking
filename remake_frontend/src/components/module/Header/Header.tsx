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

type PropsType = {
  userData: UserType | undefined;
};

export const Header = (porps: PropsType) => {
  const { userData } = porps;

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
      <header className="h-[130px] relative after:w-full after:absolute after:bottom-[-5px] after:left-0 after:h-[5px] after:bg-red-500">
        <DivVerticalCenter>
          <h1 className="text-[75px] font-thin">BOXING TALKING</h1>
        </DivVerticalCenter>
        <DivVerticalCenter className="absolute right-[50px] top-0">
          <AuthControlComponent
            userData={userData}
            logout={logout}
            openLoginForm={openLoginForm}
          />
        </DivVerticalCenter>
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
      {userData ? (
        <div className="relative h-full flex justify-center items-center">
          <div className="fixed top-3 right-[50px] flex justify-start">
            <IconContext.Provider value={{ color: "#1e1e1e", size: "25px" }}>
              <span className="mr-1">
                <BiUserCircle />
              </span>
            </IconContext.Provider>
            {userData.name}
          </div>
          <Button onClick={() => logout({ userId: userData.id! })}>
            ログアウト
          </Button>
        </div>
      ) : (
        <Button onClick={() => openLoginForm()}>ログイン</Button>
      )}
    </>
  );
};
