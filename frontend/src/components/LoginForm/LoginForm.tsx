import { CustomButton } from "@/components/Button";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "@/libs/hooks/useLogin";

// component
import SpinnerModal from "../SpinnerModal";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const locationState = location.state;
  const [state, setState] = useState(locationState as { message: string } | null);
  const { login, loginState } = useLogin();

  const LOGIN_ERROR_MESSAGE = "※ログインに失敗しました";
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(null);
    login({ email, password });
    // if (loginState.error) return;
    // navigate("/");
  };

  // if (loginState.pending) return <h1>Loading now...</h1>;
  return (
    <>
      {/* <h1>login</h1> */}
      {/* {loginState.error && <p className="text-red-500">{LOGIN_ERROR_MESSAGE}</p>} */}
      {/* {state && <p className="text-red-500">{state.message}</p>} */}
      <form className="flex" onSubmit={submit}>
        <input
          className="rounded-sm p-1 mr-3"
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
        />
        <input
          className="rounded-sm p-1 mr-3"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
        />
        <div className="relative">
          {loginState.pending && <SpinnerModal />}
          <CustomButton
            className={`text-white ${
              loginState.pending
                ? `bg-green-900 text-gray-600 pointer-events-none select-none`
                : `bg-green-600 hover:bg-green-500 text-white`
            } duration-200`}
          >
            Log in
          </CustomButton>
        </div>
      </form>
    </>
  );
};
