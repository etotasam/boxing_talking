import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FullScreenSpinnerModal } from '@/components/modal/FullScreenSpinnerModal';
//! hook
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { useFooterHeight } from '@/hooks/useFooterHeight';
import { useSignUpIdentification } from '@/hooks/useSignUpIdentification';
//! component
import { Footer } from '@/components/module/Footer';
import { RotatingLines } from 'react-loader-spinner';
// ! recoil
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { authenticatingSelector } from '@/store/authenticatingState';

export const Identification = () => {
  const { createUser } = useSignUpIdentification();
  const authenticatingState = useRecoilValue(authenticatingSelector);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get('signup');
  const { state: headerHeight } = useHeaderHeight();
  const { state: footerHeight } = useFooterHeight();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      createUser({ token });
    } else {
      navigate('/');
    }
  }, []);

  if (!token) return;

  return (
    <>
      <div
        style={{
          minHeight: `calc(100vh - (${headerHeight}px + ${footerHeight}px) - 1px)`,
        }}
        className="flex justify-center items-center"
      >
        <div className="flex justify-center items-center max-w-[600px] w-[70%] min-w-[200px] lg:h-[300px] sm:h-[250px] h-[150px] bg-white border-[1px] border-stone-600 shadow-lg">
          {authenticatingState.isLoading && <Authenticating />}
          {authenticatingState.isSuccess && <SuccessRegister />}
          {authenticatingState.isError && <FiledAuth />}
        </div>
      </div>
      <Footer />
    </>
  );
};

const Authenticating = () => {
  return (
    <>
      <p className="text-lg tracking-[0.2em]">認証中</p>
      <RotatingLines
        strokeColor="#000"
        strokeWidth="3"
        animationDuration="1"
        width="20"
      />
    </>
  );
};

const SuccessRegister = () => {
  return (
    <>
      <div className="text-center">
        <p>
          アカウントが作成されました。
          <br />
          下記よりログインしてください。
        </p>
        <Link to="/">
          <button className="mt-5 py-1 px-4 bg-stone-700 hover:bg-stone-500 text-white rounded-md">
            ログイン
          </button>
        </Link>
      </div>
    </>
  );
};
const FiledAuth = () => {
  return (
    <>
      <div className="text-center">
        <p>無効なリクエストです</p>
        <Link to="/">
          <button className="mt-5 py-1 px-4 bg-stone-700 hover:bg-stone-500 text-white rounded-md">
            Home
          </button>
        </Link>
      </div>
    </>
  );
};
