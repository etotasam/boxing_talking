import React from 'react';
import { ClearFullScreenDiv } from '@/components/atomic/ClearFullScreenDiv';
import { motion, AnimatePresence } from 'framer-motion';
// ! recoil
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { formTypeState, FORM_TYPE } from '@/store/formTypeState';
// ! components
import { SignUpForm } from '../SignUpForm';
import { Button } from '@/components/atomic/Button';
// ! hooks
import { useLogin, useGuestLogin } from '@/hooks/apiHooks/useAuth';
import { useToastModal } from '@/hooks/useToastModal';
// !etc
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from '@/assets/statusesOnToastModal';

export const LoginFormModal = ({ isShow }: { isShow: boolean }) => {
  // ! recoil
  const formType = useRecoilValue(formTypeState);

  return (
    <AnimatePresence>
      {isShow && (
        <ClearFullScreenDiv className="z-40 bg-white/20 flex justify-center items-center">
          {formType === FORM_TYPE.LOGIN_FORM && <LoginForm />}
          {formType === FORM_TYPE.SIGN_ON_FORM && <SignUpForm />}
        </ClearFullScreenDiv>
      )}
    </AnimatePresence>
  );
};

const LoginForm = () => {
  const { guestLogin } = useGuestLogin();
  // ! email passwordの入力と取得
  const email = React.useRef<string>('');
  const [defaultEmail, setDefaultEmail] = React.useState<string>('');
  const password = React.useRef<string>('');
  const [defaultPassword, setDefaultPassword] = React.useState<string>('');

  // ! recoil
  const setFormType = useSetRecoilState(formTypeState);

  // ! hooks
  const { showToastModal, setToastModal } = useToastModal();
  const { login } = useLogin();

  // ! attempt login
  /**
   * ログイン実行
   * @param e event
   * @returns void
   */
  const toLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // ? email of password が未入力の場合
    if (!email.current || !password.current) {
      setToastModal({
        message: MESSAGE.EMAIL_OR_PASSWORD_NO_INPUT,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }
    // ? ログインに失敗した場合など、再レンダリングされた時、入力値が残り、表示される為のuseState
    setDefaultEmail(email.current);
    setDefaultPassword(password.current);
    // ? emailのバリデーション
    const emailPattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+[.][A-Za-z0-9]+$/;
    if (!emailPattern.test(email.current)) {
      setToastModal({
        message: MESSAGE.EMAIL_FAILED_VALIDATE,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
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
    hide: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const toCreateAccountForm = () => {
    setFormType(FORM_TYPE.SIGN_ON_FORM);
  };

  //? ゲストログイン
  const gustLogin = () => {
    guestLogin();
  };

  return (
    <div
      // onMouseDown={(e) => e.stopPropagation()}
      className="md:w-[550px] md:h-[600px] sm:w-2/3 w-[95%] max-w-[500px] h-auto bg-white rounded fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center"
    >
      <motion.div
        initial="initial"
        animate="show"
        exit="hide"
        variants={variants}
        className="relative sm:w-[70%] sm:max-w-[450px] w-[80%] max-w-[350px] py-10"
      >
        <h1 className="w-full text-center text-stone-500 font-light text-xl mb-5">ログイン</h1>
        <form onSubmit={toLogin} className=" flex flex-col w-full">
          <input
            type="text"
            placeholder="Email"
            defaultValue={defaultEmail}
            onChange={(e) => (email.current = e.target.value)}
            className={`mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 border-stone-400 focus:border-green-500 duration-300 bg-transparent`}
          />
          <input
            type="password"
            placeholder="Password"
            defaultValue={defaultPassword}
            onChange={(e) => (password.current = e.target.value)}
            autoComplete="off"
            className="mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 border-stone-400 focus:border-green-500 duration-300 bg-transparent"
          />
          <div className="relative mt-12">
            <Button styleName="login">ログイン</Button>
          </div>
          <div className="relative mt-3">
            <Button styleName="guestLogin" onClick={gustLogin}>
              ゲストログイン
            </Button>
          </div>
          <div className="text-right mt-5">
            <a
              onClick={toCreateAccountForm}
              className="hover:border-b hover:border-blue-600 text-blue-600 text-sm cursor-pointer"
            >
              アカウント作成
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
