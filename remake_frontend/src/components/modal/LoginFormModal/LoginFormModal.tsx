import React from "react";
import { ClearFullScreenDiv } from "@/components/atomc/ClearFullScreenDiv";
import { useSetRecoilState } from "recoil";
import { loginModalSelector } from "@/store/loginModalState";

export const LoginFormModal = () => {
  // !loginモーダルを閉じるメソッド
  const setState = useSetRecoilState(loginModalSelector);
  const loginModalHide = () => {
    setState(false);
  };
  return (
    <>
      <ClearFullScreenDiv
        className="bg-stone-500/70 flex justify-center items-center"
        onClick={() => loginModalHide()}
      >
        <LoginForm />
      </ClearFullScreenDiv>
    </>
  );
};

/**
 * Login Form
 * @returns ReactNode
 */
const LoginForm = () => {
  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[50%] h-[70%] min-w-[300px] min-h-[500px] max-w-[650px] max-h-[800px] rounded-lg bg-white flex justify-center items-center"
      >
        <div className="w-[70%] h-[70%] bg-red-500">
          <h2 className="text-4xl text-center">ログイン</h2>
          <form className="flex flex-col w-full h-full">
            <input
              className="border-[1px] border-black p-1 mt-[25px]"
              type="text"
            />
            <input
              className="border-[1px] border-black p-1 mt-[25px]"
              type="password"
            />
          </form>
        </div>
      </div>
    </>
  );
};
