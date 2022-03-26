import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "@/libs/axios";

export const Check = () => {
  const [state, setState] = React.useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const click = async () => {
    try {
      const { data } = await axios.get(`/api/test`);
      setState(data);
    } catch (error) {
      console.log("なんかのエラー", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    click();
  });
  return (
    <div>
      <h1>チェック</h1>
      <div className="relative">
        <p>{state}</p>
        {isLoading && (
          <div className="absolute top-0 left-0 w-full bg-blue-300">
            <p>loading...</p>
          </div>
        )}
      </div>
      <Link to={"/login"}>テスト</Link>
    </div>
  );
};
