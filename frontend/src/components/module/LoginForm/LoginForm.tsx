import { CustomButton } from "@/components/atomic/Button";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

//! hooks
import { useLogin } from "@/libs/hooks/useAuth";

//! component
import { Spinner } from "@/components/module/Spinner";

export const LoginForm = () => {
  const emailPattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+[.][A-Za-z0-9]+$/;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const locationState = location.state;
  const [state, setState] = useState(locationState as { message: string } | null);
  // const { login, loginState } = useLogin();
  const { login: loginApi, isLoading: isAuthChecking } = useLogin();

  const [isNotice, setIsNotice] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState("");
  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsNotice(false);
    if (!email || !password) {
      setNoticeMsg("emailとpasswordの入力は必須です");
      setIsNotice(true);
      return;
    }
    if (!emailPattern.test(email)) {
      setNoticeMsg("有効なEmailではありません");
      setIsNotice(true);
      return;
    }
    setState(null);
    loginApi({ email, password });
    // if (loginState.error) return;
    // navigate("/");
  };

  const noticeClear = () => {
    setIsNotice(false);
    setNoticeMsg("");
  };

  // if (loginState.pending) return <h1>Loading now...</h1>;
  return (
    <div className="relative">
      <form className="flex" onSubmit={login}>
        <input
          className="rounded-sm p-1 mr-3 h-[30px]"
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
        />
        <input
          className="rounded-sm p-1 mr-3 h-[30px]"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
        />
        <div className="relative">
          {isAuthChecking && <Spinner size={20} />}
          <CustomButton
            dataTestid={"login-btn"}
            className={`text-white text-sm h-[30px] ${
              isAuthChecking
                ? `bg-green-900 text-gray-600 pointer-events-none select-none`
                : `bg-green-600 hover:bg-green-700 text-white`
            } duration-200`}
          >
            ログイン
          </CustomButton>
        </div>
      </form>
      {isNotice && <Notice noticeMsg={noticeMsg} notice={noticeClear} />}
    </div>
  );
};

type NoticePropsType = {
  notice: () => void;
  noticeMsg: string;
};

const Notice = ({ notice, noticeMsg }: NoticePropsType) => {
  return (
    <div className="z-10 absolute top-[calc(100%+10px)] right-0">
      <div className="relative text-white bg-red-600 p-6">
        <p>{noticeMsg}</p>
        <button data-testid={"hide-notice-btn"} onClick={notice} className="absolute top-0 right-2">
          ✕
        </button>
      </div>
    </div>
  );
};
