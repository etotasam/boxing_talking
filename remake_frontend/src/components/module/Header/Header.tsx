import { useEffect, useRef } from 'react';
// ! modules
import { Button } from '@/components/atomc/Button';
// ! recoil
import { useSetRecoilState } from 'recoil';
import { formTypeSelector, FORM_TYPE } from '@/store/formTypeState';
import { loginModalSelector } from '@/store/loginModalState';
// ! types
import { UserType } from '@/assets/types';
// ! hooks
import { useLogout } from '@/hooks/useAuth';
import { useHeaderAndBottomHeight } from '@/hooks/useHeaderAndBottomHeightState';
// ! icons
import { IconContext } from 'react-icons';
import { BiUserCircle } from 'react-icons/bi';
//! component
import { LinkList } from '../LinkList';
import { useAdmin } from '@/hooks/useAuth';
//! env
const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

type PropsType = {
  userData: UserType | undefined;
};

export const Header = (porps: PropsType) => {
  const { userData } = porps;
  const { isAdmin } = useAdmin();
  const { setHeaderHeight } = useHeaderAndBottomHeight();

  const headerRef = useRef(null);
  useEffect(() => {
    if (!headerRef.current) return;
    const height = (headerRef.current as HTMLHeadElement).clientHeight;
    setHeaderHeight(height);
  }, [headerRef.current]);

  const setFormType = useSetRecoilState(formTypeSelector);

  // ! loginモーダルの表示のOn/Offメソッド
  const setLoginModalState = useSetRecoilState(loginModalSelector);
  const openLoginForm = () => {
    setFormType(FORM_TYPE.LOGIN_FORM);
    setLoginModalState(true);
  };

  const { logout } = useLogout();

  return (
    <>
      <header
        ref={headerRef}
        className="sm:h-[80px] h-[70px] felx relative after:w-full after:absolute after:bottom-0 after:left-0 after:h-[3px] after:bg-red-500"
      >
        {/* <DivVerticalCenter> */}
        <h1 className="md:text-[64px] sm:text-[54px] text-[36px] select-none absolute md:top-0 sm:top-2 top-5 left-0 font-thin">
          {siteTitle}
        </h1>
        {/* </DivVerticalCenter> */}
        {isAdmin && (
          <div className="absolute right-[200px] top-0">
            <LinkList />
          </div>
        )}
        {/* <LinkList /> */}
        {/* <DivVerticalCenter className="absolute right-[50px] top-0"> */}

        {userData && (
          <div className="absolute top-0 right-[30px] flex">
            <IconContext.Provider value={{ color: '#1e1e1e', size: '25px' }}>
              <span className="mr-1">
                <BiUserCircle />
              </span>
            </IconContext.Provider>
            {userData.name}
          </div>
        )}
        <AuthControlComponent
          userData={userData}
          logout={logout}
          openLoginForm={openLoginForm}
        />
        {/* </DivVerticalCenter> */}
      </header>
    </>
  );
};

type AuthControlComponentPropsType = {
  userData: UserType | undefined;
  logout: ({ userName }: { userName: string }) => void;
  openLoginForm: () => void;
};
// ! ログイン/ログアウトのボタン
const AuthControlComponent = ({
  userData,
  logout,
  openLoginForm,
}: AuthControlComponentPropsType) => {
  return (
    <>
      <div className="absolute top-0 right-0 md:w-[200px] w-[130px] h-full flex justify-center">
        <div className="absolute bottom-3 flex justify-center">
          {userData ? (
            <Button onClick={() => logout({ userName: userData.name! })}>
              ログアウト
            </Button>
          ) : (
            <Button onClick={() => openLoginForm()}>ログイン</Button>
          )}
        </div>
      </div>
    </>
  );
};
