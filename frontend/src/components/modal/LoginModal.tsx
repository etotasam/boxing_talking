import React, { useEffect, useState } from "react";
import { WINDOW_WIDTH } from "@/libs/utils";
//! custom hooks
import { useQueryState } from "@/libs/hooks/useQueryState";
import { useCreateUser } from "@/libs/hooks/useAuth";
import { useLogin } from "@/libs/hooks/useAuth";
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
//! components
import { Spinner } from "@/components/module/Spinner";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

export const LoginModal = () => {
  const { setter: setIsOpenLoginModal } = useQueryState<boolean>("q/isOpenLoginModal");
  const { setter: setIsOpenSignUpModal } = useQueryState<boolean>("q/isOpenSignUpModal");

  // const { createUser, isLoading: isCreatingUser, isSuccess: isSuccessCreateUser } = useCreateUser();
  const { login, isSuccess: isSuccessfullyLogin, isLoading: isLoadingLogin } = useLogin();
  const { setToastModalMessage } = useToastModal();

  //? アカウント作成
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setToastModalMessage({
        message: MESSAGE.SIGNUP_LACK_INPUT,
        bgColor: ModalBgColorType.NOTICE,
      });
      return;
    }
    login({ email, password });
    // createUser({ name, email, password });
  };

  //? window widthが指定のサイズ以上になったら閉じる
  const { width: windowWidth } = useGetWindowSize();
  useEffect(() => {
    if (windowWidth > WINDOW_WIDTH.lg) {
      setIsOpenLoginModal(false);
    }
  }, [windowWidth]);

  //? ログインが成功したらモーダル閉じてstateのリセット
  useEffect(() => {
    if (!isSuccessfullyLogin) return;
    setIsOpenLoginModal(false);
    setEmail("");
    setPassword("");
  }, [isSuccessfullyLogin]);

  const openAccountModal = () => {
    setIsOpenLoginModal(false);
    setIsOpenSignUpModal(true);
  };

  return (
    <div
      onClick={() => setIsOpenLoginModal(false)}
      className="z-50 absolute top-0 left-0 w-full h-full bg-stone-500/50"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-1/2 min-w-[350px] max-w-[500px] h-3/5 min-h-[450px] bg-white rounded fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center"
      >
        <div className="relative w-[70%]">
          <h1 className="absolute top-[-60px] left-0 w-full text-center text-stone-500 font-light text-xl">
            ログイン
          </h1>
          <form onSubmit={submit} className=" flex flex-col w-full">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-8 px-2 py-1 outline-none border-b rounded-none duration-300 bg-transparent text-stone-600 focus:border-green-500 ${
                email ? `border-green-500` : `border-stone-500`
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-8 px-2 py-1 outline-none border-b rounded-none border-stone-500 text-stone-600 focus:border-green-500 duration-300 bg-transparent"
            />
            <div className="relative mt-12 ">
              <button className="h-[30px] w-full bg-green-500 hover:bg-green-600 rounded duration-300 text-white">
                ログイン
              </button>
              {isLoadingLogin && <Spinner size={20} />}
            </div>
            <div className="text-right mt-5">
              <button
                onClick={openAccountModal}
                className="hover:border-b hover:border-blue-600 text-blue-600 text-sm cursor-pointer"
              >
                アカウント作成
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
