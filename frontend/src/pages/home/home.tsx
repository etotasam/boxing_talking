import React, { useCallback } from "react";
import { useAuth } from "@/libs/hooks/useAuth";
import axios from "@/libs/axios";

// components
import { LayoutDefault } from "@/layout/LayoutDefault";
import { Matches } from "@/components/Matches";

export const Home = () => {
  const {
    authState: { hasAuth, user: authUser },
  } = useAuth();

  const queue = useCallback(async () => {
    const { data } = await axios.put(`api/${authUser.id}/test`);
    console.log(data);
  }, [authUser]);

  return (
    <LayoutDefault>
      <Matches />
    </LayoutDefault>
  );
};
