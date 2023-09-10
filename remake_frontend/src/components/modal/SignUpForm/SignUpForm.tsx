import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
// ! recoil
import { useSetRecoilState } from "recoil";
import { formTypeSelector, FORM_TYPE } from "@/store/formTypeState";
//! hooks
import { useAuth, useCreateUser } from "@/hooks/useAuth";
// import { useQueryState } from "@/libs/hooks/useQueryState";
// import { useCreateUser } from "@/libs/hooks/useAuth";
// import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
//! components
// import { Spinner } from "@/components/module/Spinner";
//! message contoller
// import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
// import { MESSAGE } from "@/libs/utils";

export const SignUpForm = () => {
  const { createUser } = useCreateUser();

  //? アカウント作成
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  //? Email検証
  const validationEmail =
    /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+[.][A-Za-z0-9]+$/;
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  // const isInvalidEmail = validationEmail.test(email);
  const [isFocusOnEmailInput, setIsFocusOnEmailInput] = useState(false);
  const hasNoteOnEmail = !isFocusOnEmailInput && isInvalidEmail && !!email;

  //? passwordに大文字が含まれてるか
  const validationUppercase = /[A-Z]+/;
  const isValidUppercase = validationUppercase.test(password);
  //? passwordに文字数制限
  const validationLength = /^.{8,24}$/;
  const isValidLength = validationLength.test(password);
  //? passwordに数字が含まれてるか
  const validationHasNumber = /[0-9]/;
  const isValidHasNumber = validationHasNumber.test(password);
  //? password全体の検証
  const isInvalidPassword = [
    isValidUppercase,
    isValidLength,
    isValidHasNumber,
  ].includes(false);
  // const validationPassword = /^(?=.*[A-Z])(?=.*[.?/-])[a-zA-Z0-9.?/-]{8,24}$/;
  // const [isInvalidPassword, setIsInvalidPassword] = useState(false);

  /**
   * Form Send (User Resist)
   * @param e Event
   * @retruns void
   */
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createUser({ name, email, password });
  };

  const offFocusEmailInput = () => {
    setIsFocusOnEmailInput(false);
    if (email) {
      setIsInvalidEmail(!validationEmail.test(email));
    }
  };

  // useEffect(() => {
  //   if (!isSuccessCreateUser) return;
  //   setName("");
  //   setEmail("");
  //   setPassword("");
  // }, [isSuccessCreateUser]);

  // const { width: windowWidth } = useGetWindowSize();
  // const openLoginModal = () => {
  //   setIsOpenSignUpModal(false);
  //   setIsOpenLoginModal(true);
  // };
  // ! recoil
  const setFormType = useSetRecoilState(formTypeSelector);
  const toLoginForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setFormType(FORM_TYPE.LOGIN_FORM);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="w-1/2 min-w-[350px] max-w-[500px] min-h-[450px] bg-white rounded fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.3 } }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        className="relative w-[70%] py-10"
      >
        <h1 className="w-full text-center text-stone-500 font-light text-xl">
          アカウント作成
        </h1>
        <form onSubmit={submit} className="flex flex-col w-full pt-5">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 border-stone-400 focus:border-green-500 duration-300 bg-transparent`}
          />
          {/* <div className="relative">
            {hasNoteOnEmail && (
              <span className="absolute bottom-[30px] left-2 text-red-600 before:content-['※有効なEmailではありません']" />
            )} */}
          <input
            type="text"
            placeholder="Email"
            value={email}
            onFocus={() => setIsFocusOnEmailInput(true)}
            onBlur={() => offFocusEmailInput()}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 border-stone-400 focus:border-green-500 duration-300 bg-transparent`}
          />
          {/* </div> */}

          <input
            type={"password"}
            placeholder="Create Password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={clsx(
              "mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 border-stone-400 focus:border-green-500 duration-300 bg-transparent"
            )}
          />
          <div className="mt-3 p-3 border-[1px] border-stone-300 text-stone-500">
            <p className="">パスワードは以下が必要です</p>
            <ul className="mt-2 space-y-1">
              <li
                className={clsx(
                  `relative pl-[15px] before:absolute before:top-0 before:left-0 before:w-[2px]`,
                  isValidLength
                    ? `text-green-700/60 before:content-["✓"]`
                    : `before:content-[""]`
                )}
              >
                <span>長さ8~24文字</span>
              </li>
              <li
                className={clsx(
                  `relative pl-[15px] before:absolute before:top-0 before:left-0 before:w-[2px]`,
                  isValidUppercase
                    ? `text-green-700/60 before:content-["✓"]`
                    : `before:content-[""]`
                )}
              >
                大文字を含む
              </li>
              <li
                className={clsx(
                  `relative pl-[15px] before:absolute before:top-0 before:left-0 before:w-[2px]`,
                  isValidHasNumber
                    ? `text-green-700/60 before:content-["✓"]`
                    : `before:content-[""]`
                )}
              >
                数字を含む
              </li>
            </ul>
          </div>

          <div className="relative mt-5 ">
            <button
              className={clsx(
                `h-[30px] w-full rounded duration-300 text-white`,
                !email || isInvalidEmail || isInvalidPassword
                  ? `bg-stone-500 pointer-events-none cursor-default`
                  : `bg-green-500 hover:bg-green-600`
              )}
            >
              登録
            </button>
            {/* {isCreatingUser && <Spinner size={20} />} */}
          </div>

          <div className="text-right mt-5">
            <button
              onClick={toLoginForm}
              className={clsx(
                `hover:border-b hover:border-blue-600 text-blue-600 text-sm cursor-pointer`
              )}
            >
              ログイン
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
