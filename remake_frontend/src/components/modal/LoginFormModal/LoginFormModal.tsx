import React, { ReactNode } from "react";
import { ClearFullScreenDiv } from "@/components/atomc/ClearFullScreenDiv";
import { useSetRecoilState } from "recoil";
import { loginModalSelector } from "@/store/loginModalState";
import { motion } from "framer-motion";
// ! hooks
import { useLogin } from "@/hooks/useAuth";
import { useToastModal } from "@/hooks/useToastModal";
// !etc
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from "@/assets/statusesOnToastModal";

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
        <PreviousOne />
        {/* <LoginForm /> */}
      </ClearFullScreenDiv>
    </>
  );
};

/**
 * Login Form
 * @returns ReactNode
 */
const LoginForm = (): ReactNode => {
  return (
    <>
      <div className="w-[50%] h-[70%] min-w-[300px] min-h-[500px] max-w-[650px] max-h-[800px] rounded-lg bg-white flex justify-center items-center">
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
            <button>test</button>
          </form>
        </div>
      </div>
    </>
  );
};

const PreviousOne = () => {
  // ! email passwordの入力と取得
  const email = React.useRef<string>("");
  const [defaultEmail, setDefaultEmail] = React.useState<string>("");
  const password = React.useRef<string>("");
  const [defaultPassword, setDefaultPassword] = React.useState<string>("");

  // ! hooks
  const { showToastModal, setToastModal } = useToastModal();
  const { login } = useLogin();

  // ! attempt login
  /**
   * ログイン実行
   * @param e event
   * @returns void
   */
  const toLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ? email of password が未入力の場合
    if (!email.current || !password.current) {
      setToastModal({
        message: MESSAGE.EMAIL_OR_PASSWORD_NO_INPUT,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      console.error("Email or Password is not Enter");
      return;
    }
    // ? ログインに失敗した場合など、再レンダリングされた時、入力値が残り、表示される為のuseState
    setDefaultEmail(email.current);
    setDefaultPassword(password.current);
    // ? emailのバリデーション
    const emailPattern =
      /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+[.][A-Za-z0-9]+$/;
    if (!emailPattern.test(email.current)) {
      setToastModal({
        message: MESSAGE.EMAIL_FAILED_VALIDATE,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      console.log("Entered Email Failed to emailPattern Validation");
      return;
    }
    login({ email: email.current, password: password.current });
  };

  const variants = {
    initial: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="show"
      variants={variants}
      onClick={(e) => e.stopPropagation()}
      className="w-1/2 min-w-[350px] max-w-[500px] h-3/5 min-h-[450px] bg-white rounded fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center"
    >
      <div className="relative w-[70%]">
        <h1 className="absolute top-[-60px] left-0 w-full text-center text-stone-500 font-light text-xl">
          ログイン
        </h1>
        <form onSubmit={toLogin} className=" flex flex-col w-full">
          <input
            type="text"
            placeholder="Email"
            defaultValue={defaultEmail}
            onChange={(e) => (email.current = e.target.value)}
            className={`mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 border-stone-400 focus:border-green-500 duration-300 bg-transparent}`}
          />
          <input
            type="password"
            placeholder="Password"
            defaultValue={defaultPassword}
            onChange={(e) => (password.current = e.target.value)}
            className="mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 border-stone-400 focus:border-green-500 duration-300 bg-transparent"
          />
          <div className="relative mt-12 ">
            <button className="h-[30px] w-full bg-stone-700 hover:bg-stone-600 rounded duration-300 text-white">
              ログイン
            </button>
          </div>
          <div className="text-right mt-5">
            <button className="hover:border-b hover:border-blue-600 text-blue-600 text-sm cursor-pointer">
              アカウント作成
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
