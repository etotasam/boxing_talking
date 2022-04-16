import { useEffect } from "react";
import Button from "@/components/Button";
import axios, { isAxiosError } from "@/libs/axios";
import { useState } from "react";
// import { login } from "@/store/slice/authUserSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLoginController } from "@/libs/hooks/authController";
import { useLogin } from "@/libs/hooks/useLogin";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [errorMessage, setErrorMessage] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const locationState = location.state;
  const [state, setState] = useState(
    locationState as { message: string } | null
  );
  // const { loginCont } = useLoginController();
  const { login } = useLogin();
  const { loginState } = useLogin();

  // const loadindStart = () => {
  //   setIsLoading(true);
  // };

  // const loadindEnd = () => {
  //   setIsLoading(false);
  // };

  const LOGIN_ERROR_MESSAGE = "※ログインに失敗しました";
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(null);
    await login({ email, password });
    navigate("/");
    // setErrorMessage("");
    // loadindStart();
    // try {
    //   await login({ email, password });
    //   setEmail("");
    //   setPassword("");
    //   navigate("/");
    // } catch (error) {
    //   if (isAxiosError(error)) {
    //     setErrorMessage(`※ログインに失敗しました`);
    //     loadindEnd();
    //   }
    // }
  };
  // useEffect(() => {
  //   return () => {
  //     loadindEnd();
  //   };
  // }, []);

  if (loginState.pending) return <h1>Loading now...</h1>;
  return (
    <>
      <h1>login</h1>
      {loginState.error && (
        <p className="text-red-500">{LOGIN_ERROR_MESSAGE}</p>
      )}
      {state && <p className="text-red-500">{state.message}</p>}
      <form onSubmit={submit}>
        <input
          className="border border-gray-500 rounded px-1"
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
        />
        <input
          className="border border-gray-500 rounded px-1"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
        />
        <Button>ログイン</Button>
      </form>
      <Link className="text-blue-400" to="/">
        Homeへ
      </Link>
    </>
  );
};
