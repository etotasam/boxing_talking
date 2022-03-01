import { useEffect } from "react";
import axios, { isAxiosError } from "@/libs/axios";
import { useState } from "react";
import Button from "@/components/Button";
import { useDispatch } from "react-redux";
import { login } from "@/store/slice/authUserSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const location = useLocation();
  const locationState = location.state;
  const [state, setState] = useState(
    locationState as { message: string } | null
  );

  const loadindStart = () => {
    setIsLoading(true);
  };

  const loadindEnd = () => {
    setIsLoading(false);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(null);
    setErrorMessage("");
    loadindStart();
    try {
      await axios.get("sanctum/csrf-cookie");
      const { data } = await axios.post("/api/login", { email, password });
      dispatch(login(data));
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
        setErrorMessage(`※ログインに失敗しました`);
        loadindEnd();
      }
    }
  };
  useEffect(() => {
    return () => {
      loadindEnd();
    };
  }, []);

  if (isLoading) return <h1>Loading now...</h1>;
  return (
    <>
      <h1>login</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
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
