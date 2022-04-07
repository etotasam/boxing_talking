import { useEffect } from "react";
import {
  useHasAuth,
  AuthIs,
  useAuthUserLoading,
  fetchAuthUser,
} from "@/store/slice/authUserSlice";
import {
  useMatches,
  useMatchesLoading,
  fetchMatches,
} from "@/store/slice/matchesSlice";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";

const Middleware1 = () => {
  const isAuth: AuthIs = useHasAuth();
  const isLoading = useAuthUserLoading();
  const dispatch = useDispatch();

  const authCheck = () => {
    // ログインしているか、1回でもauthチェックをしている場合はapiを投げない様にする
    if (isAuth === AuthIs.TRUE || isAuth !== AuthIs.UNDEFINED) return;
    dispatch(fetchAuthUser());
  };

  const allMatches = useMatches();
  const matchesLoading = useMatchesLoading();
  const getMatches = () => {
    if (allMatches) return;
    dispatch(fetchMatches());
  };

  useEffect(() => {
    getMatches();
    authCheck();
  }, []);
  return isLoading || matchesLoading ? <p>Loading...</p> : <Outlet />;
};

export default Middleware1;
