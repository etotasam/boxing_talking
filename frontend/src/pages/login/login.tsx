import axios, { isAxiosError } from "../../libs/axios";
import { useState, useEffect } from "react";
import Button from "../../components/Button";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.get("sanctum/csrf-cookie");
      const { data } = await axios.post("/api/login");
      console.log(data);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
      }
    }
  };
  return (
    <>
      <h1>login</h1>
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
    </>
  );
};
