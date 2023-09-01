import React from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "react-query";
import { queryKeys } from "@/assets/queryKeys";
// ! hooks
import { useAuth } from "@/hooks/useAuth";

const Container = () => {
  const queryClient = useQueryClient();

  const { isError } = useAuth();
  //? cookieでログインチェック。なければfalseを入れる
  React.useEffect(() => {
    if (!isError) return;
    queryClient.setQueryData(queryKeys.auth, false);
  }, [isError]);

  return (
    <>
      <Outlet />
    </>
  );
};

export default Container;
