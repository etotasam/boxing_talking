import { Button } from "@/components/Button";
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLogin } from "@/libs/hooks/useLogin";
import { LoginForm } from "@/components/LoginForm/";

export const Login = () => {
  // const navigate = useNavigate();
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const location = useLocation();
  // const locationState = location.state;
  // const [state, setState] = useState(locationState as { message: string } | null);
  // const { login, loginState } = useLogin();

  // const LOGIN_ERROR_MESSAGE = "※ログインに失敗しました";
  // const submit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setState(null);
  //   await login({ email, password });
  //   if (loginState.error) return;
  //   navigate("/");
  // };

  // if (loginState.pending) return <h1>Loading now...</h1>;
  return (
    <LoginForm />
    // <>
    //   <h1>login</h1>
    //   {loginState.error && <p className="text-red-500">{LOGIN_ERROR_MESSAGE}</p>}
    //   {state && <p className="text-red-500">{state.message}</p>}
    //   <form onSubmit={submit}>
    //     <input
    //       className="border border-gray-500 rounded px-1"
    //       type="text"
    //       onChange={(e) => setEmail(e.target.value)}
    //       value={email}
    //       placeholder="Email"
    //     />
    //     <input
    //       className="border border-gray-500 rounded px-1"
    //       type="password"
    //       onChange={(e) => setPassword(e.target.value)}
    //       value={password}
    //       placeholder="Password"
    //     />
    //     <Button>Log in</Button>
    //   </form>
    //   <Link className="text-blue-400" to="/">
    //     Homeへ
    //   </Link>
    // </>
  );
};
