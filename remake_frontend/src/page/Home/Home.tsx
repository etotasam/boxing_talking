import React from "react";
import { useAdmin } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "react-query";
import { QUERY_KEY } from "@/assets/queryKeys";
import { UserType } from "@/assets/types";
// ! components
import { FightBox } from "@/components/module/FightBox";

export const Home = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAdmin();
  const click = () => {
    const authUser = queryClient.getQueryData<UserType>(QUERY_KEY.auth);
    if (!authUser) return;
    isAdmin({ userId: authUser.id });
  };
  return (
    <>
      <div>Home</div>
      {/* <button onClick={click}>admin check</button> */}
      <FightBox />
    </>
  );
};
