import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineClose } from 'react-icons/ai';
import { clsx } from 'clsx';
// ! recoil
import { useSetRecoilState } from 'recoil';
import { formTypeSelector, FORM_TYPE } from '@/store/formTypeState';
//! hooks
import { usePreSignUp } from '@/hooks/useAuth';

export const SignUpForm = () => {
  const { preSignUp, isSuccess: isSuccessPreRegister } = usePreSignUp();

  //? アカウント作成
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPassedValidateName, setIsPassedValidateName] = useState<boolean>();
  const [isPassedValidateEmail, setIsPassedValidateEmail] = useState<boolean>();
  const [isPassedValidatePassword, setIsPassedValidatePassword] =
    useState<boolean>();

  useEffect(() => {
    const state = name.length >= 3 && name.length <= 30;
    setIsPassedValidateName(state);
  }, [name]);
  useEffect(() => {
    const validationEmail =
      /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+[.][A-Za-z0-9]+$/;
    const state = validationEmail.test(email);
    setIsPassedValidateEmail(state);
  }, [email]);
  useEffect(() => {
    const state = isValidUppercase && isValidLength && isValidHasNumber;
    setIsPassedValidatePassword(state);
  }, [password]);

  //? passwordに大文字が含まれてるか
  const validationUppercase = /[A-Z]+/;
  const isValidUppercase = validationUppercase.test(password);
  //? passwordに文字数制限
  const validationLength = /^.{8,24}$/;
  const isValidLength = validationLength.test(password);
  //? passwordに数字が含まれてるか
  const validationHasNumber = /[0-9]/;
  const isValidHasNumber = validationHasNumber.test(password);

  /**
   * Form Send (User Resist)
   * @param e Event
   * @retruns void
   */
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    preSignUp({ name, email, password });
  };

  useEffect(() => {
    if (!isSuccessPreRegister) return;
    setName('');
    setEmail('');
    setPassword('');
    setIsShowPreSignUpModal(true);
  }, [isSuccessPreRegister]);

  // ! recoil
  const setFormType = useSetRecoilState(formTypeSelector);
  const toLoginForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setFormType(FORM_TYPE.LOGIN_FORM);
  };

  const [isShowPreSignUpModal, setIsShowPreSignUpModal] = useState(false);

  const passwordPassedConditions = [
    { word: '長さ8~24文字', condition: isValidLength },
    { word: '大文字を含む', condition: isValidUppercase },
    { word: '数字を含む', condition: isValidHasNumber },
  ];

  return (
    <>
      {isShowPreSignUpModal && (
        <PreSignUpModal onClick={setIsShowPreSignUpModal} />
      )}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        className="md:w-[550px] md:h-[600px] sm:w-2/3 sm:h-2/3 w-[95%] max-w-[500px] h-2/3 bg-white rounded fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="relative sm:w-[70%] sm:max-w-[450px] w-[80%] max-w-[350px] py-10"
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
              className={clsx(
                `mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600  focus:border-green-500 duration-300 bg-transparent`,
                isPassedValidateName ? 'border-green-500' : 'border-stone-400'
              )}
            />

            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={clsx(
                `mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 focus:border-green-500 duration-300 bg-transparent`,
                isPassedValidateEmail ? 'border-green-500' : 'border-stone-400'
              )}
            />

            <input
              type={'password'}
              placeholder="Create Password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={clsx(
                'mt-8 px-2 py-1 outline-none border-b rounded-none placeholder:text-stone-400 text-stone-600 focus:border-green-500 duration-300 bg-transparent',
                isPassedValidatePassword
                  ? 'border-green-500'
                  : 'border-stone-400'
              )}
            />
            <div className="mt-3 p-3 border-[1px] border-stone-300 text-stone-500">
              <p className={clsx(isPassedValidateName && `text-green-700/60`)}>
                名前は3~30文字
              </p>
              <p className="mt-2">パスワードは以下が必要です</p>
              <ul className="mt-2 space-y-1">
                {passwordPassedConditions.map((el) => (
                  <li
                    key={el.word}
                    className={clsx(
                      `relative pl-[15px] before:absolute before:top-0 before:left-0 before:w-[2px] text-sm`,
                      el.condition
                        ? `text-green-700/60 before:content-["✓"]`
                        : `before:content-[""]`
                    )}
                  >
                    <span>{el.word}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-5 ">
              <button
                className={clsx(
                  `h-[30px] w-full rounded duration-300 text-white`,
                  isPassedValidateName &&
                    isPassedValidateEmail &&
                    isPassedValidatePassword
                    ? `bg-green-500 hover:bg-green-600`
                    : `bg-stone-500 pointer-events-none cursor-default`
                )}
              >
                登録
              </button>
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
    </>
  );
};

const PreSignUpModal = ({ onClick }: { onClick: (bool: boolean) => void }) => {
  return (
    <div
      onMouseDown={() => onClick(false)}
      className="z-10 fixed bg-white/20 w-[100vw] h-[100vh] flex justify-center items-center"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative flex justify-center items-center md:w-[700px] md:h-[400px] sm:w-2/3 sm:h-2/3 w-[95%] h-2/3 shadow-lg shadow-black/30 bg-white border-[1px] border-stone-600"
      >
        <AiOutlineClose
          onClick={() => onClick(false)}
          className={'cursor-pointer absolute top-2 right-2 text-[20px]'}
        />
        <div>
          <h2 className="text-center mb-5 text-stone-600 text-xl">
            仮登録が完了しました。
          </h2>
          <p className="text-stone-600">
            お送りしたメールにて本人確認と本登録が完了いたします。
          </p>
          <p className="text-stone-600">(30分以上経過しますと無効となります)</p>
        </div>
      </div>
    </div>
  );
};
