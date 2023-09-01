import React from "react";
// ! modules
import { Button } from "@/components/atomc/Button";
import { DivVerticalCenter } from "@/components/atomc/DivVerticalCenter";
import { LoginFormModal } from "@/components/modal/LoginFormModal";
import { useSetRecoilState } from "recoil";
import { loginModalSelector } from "@/store/loginModalState";

type Props = {
  isShowLoginModal: boolean;
};

export const Header = ({ isShowLoginModal }: Props) => {
  // ! loginモーダルの表示のOn/Offメソッド
  const setLoginModalState = useSetRecoilState(loginModalSelector);
  const toggleToLoginModal = () => {
    setLoginModalState(!isShowLoginModal);
  };

  return (
    <>
      <header className="h-[130px] relative after:w-full after:absolute after:bottom-[-5px] after:left-0 after:h-[5px] after:bg-red-500">
        <DivVerticalCenter>
          <h1 className="text-[75px] font-thin">BOXING TALKING</h1>
        </DivVerticalCenter>
        <div className="absolute right-[50px] top-0 h-full flex justify-center items-center">
          <Button onClick={() => toggleToLoginModal()}>ログイン</Button>
        </div>
        {/* <p className="bg-red-500">test</p> */}
      </header>
      {isShowLoginModal && <LoginFormModal />}
    </>
  );
};
