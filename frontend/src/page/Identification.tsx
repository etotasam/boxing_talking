import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
//! layout
import HeaderOnlyLayout from '@/layout/HeaderOnlyLayout';
//! hook
import { useSignUpIdentification } from '@/hooks/apiHooks/useAuth';
//! component
import { Footer } from '@/components/module/Footer';
import { RotatingLines } from 'react-loader-spinner';
// ! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { authCheckingState } from '@/store/authCheckingState';
import { tokenErrorMessageState } from '@/store/tokenErrorMessageState';

export const Identification = () => {
  const { createUser } = useSignUpIdentification();
  const authCheckState = useRecoilValue(authCheckingState);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get('signup');
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  const footerHeight = useRecoilValue(elementSizeState('FOOTER_HEIGHT'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      createUser({ token });
    } else {
      navigate(ROUTE_PATH.HOME);
    }
  }, []);

  if (!token) return;

  return (
    <HeaderOnlyLayout>
      <div
        style={{
          minHeight: `calc(100vh - (${headerHeight}px + ${footerHeight}px) - 1px)`,
        }}
        className="flex justify-center items-center"
      >
        <div className="flex justify-center items-center max-w-[600px] w-[70%] min-w-[200px] lg:h-[300px] sm:h-[250px] h-[150px] bg-white border-[1px] border-stone-600 shadow-lg">
          {authCheckState.isLoading && <Authenticating />}
          {authCheckState.isSuccess && <SuccessRegister />}
          {authCheckState.isError && <FiledAuth />}
        </div>
      </div>
      <Footer />
    </HeaderOnlyLayout>
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
        <Link
          className="inline-block mt-5 py-1 px-4 bg-stone-700 hover:bg-stone-500 text-white rounded-md"
          to={ROUTE_PATH.HOME}
        >
          {/* <span className="inline-block mt-5 py-1 px-4 bg-stone-700 hover:bg-stone-500 text-white rounded-md"> */}
          ログイン
          {/* </span> */}
        </Link>
      </div>
    </>
  );
};

const FiledAuth = () => {
  const tokenErrorMessage = useRecoilValue(tokenErrorMessageState);
  return (
    <>
      <div className="text-center">
        {tokenErrorMessage ? (
          <p>{tokenErrorMessage}</p>
        ) : (
          <p>無効なリクエストです</p>
        )}
        <Link
          className="inline-block mt-5 py-1 px-4 bg-stone-700 hover:bg-stone-500 text-white rounded-md"
          to={ROUTE_PATH.HOME}
        >
          {/* <span className="inline-block mt-5 py-1 px-4 bg-stone-700 hover:bg-stone-500 text-white rounded-md"> */}
          Home
          {/* </span> */}
        </Link>
      </div>
    </>
  );
};
