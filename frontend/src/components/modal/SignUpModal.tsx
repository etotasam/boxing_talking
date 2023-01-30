import React, { useEffect, useState } from "react";
import { WINDOW_WIDTH } from "@/libs/utils";
//! custom hooks
import { useQueryState } from "@/libs/hooks/useQueryState";
import { useCreateUser } from "@/libs/hooks/useAuth";
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
//! components
import { Spinner } from "@/components/module/Spinner";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

export const SignUpModal = () => {
  const { setter: setIsOpenSignUpModal } = useQueryState<boolean>("q/isOpenSignUpModal");
  const { setter: setIsOpenLoginModal } = useQueryState<boolean>("q/isOpenLoginModal");

  const { createUser, isLoading: isCreatingUser, isSuccess: isSuccessCreateUser } = useCreateUser();
  const { setToastModalMessage } = useToastModal();

  //? アカウント作成
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setToastModalMessage({
        message: MESSAGE.SIGNUP_LACK_INPUT,
        bgColor: ModalBgColorType.NOTICE,
      });
      return;
    }
    createUser({ name, email, password });
  };

  useEffect(() => {
    if (!isSuccessCreateUser) return;
    setName("");
    setEmail("");
    setPassword("");
  }, [isSuccessCreateUser]);

  const { width: windowWidth } = useGetWindowSize();
  const openLoginModal = () => {
    setIsOpenSignUpModal(false);
    setIsOpenLoginModal(true);
  };

  return (
    <div
      onClick={() => setIsOpenSignUpModal(false)}
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
            アカウント作成
          </h1>
          <form onSubmit={submit} className=" flex flex-col w-full">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`px-2 py-1 outline-none border-b duration-300 bg-transparent text-stone-600 focus:border-green-500 ${
                name ? `border-green-500` : `border-stone-500`
              }`}
            />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-8 px-2 py-1 outline-none border-b duration-300 bg-transparent text-stone-600 focus:border-green-500 ${
                email ? `border-green-500` : `border-stone-500`
              }`}
            />
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-8 px-2 py-1 outline-none border-b border-stone-500 focus:border-green-500 duration-300 bg-transparent"
            />
            <div className="relative mt-12 ">
              <button className="h-[30px] w-full bg-green-500 hover:bg-green-600 rounded duration-300 text-white">
                登録
              </button>
              {isCreatingUser && <Spinner size={20} />}
            </div>
            {windowWidth && windowWidth < WINDOW_WIDTH.lg && (
              <div className="text-right mt-5">
                <button
                  onClick={openLoginModal}
                  className="hover:border-b hover:border-blue-600 text-blue-600 text-sm cursor-pointer"
                >
                  ログイン
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
