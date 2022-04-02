import { useEffect } from "react";
import {
  selectAuth,
  AuthIs,
  selectAuthUserLoading,
  fetchAuthUser,
} from "@/store/slice/authUserSlice";
import {
  selectMatches,
  selectMatchesLoading,
  fetchMatches,
} from "@/store/slice/matchesSlice";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";

const Middleware1 = () => {
  const isAuth: AuthIs = useSelector(selectAuth);
  const isLoading = useSelector(selectAuthUserLoading);
  const dispatch = useDispatch();

  const authCheck = () => {
    // ログインしているか、1回でもauthチェックをしている場合はapiを投げない様にする
    if (isAuth === AuthIs.TRUE || isAuth !== AuthIs.UNDEFINED) return;
    dispatch(fetchAuthUser());
  };

  const allMatches = useSelector(selectMatches);
  const matchesLoading = useSelector(selectMatchesLoading);
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
