import { useEffect } from "react";
import { AuthIs, fetchAuthUser } from "@/store/slice/authUserSlice";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";

//! hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";

//! component
import { LoadingModal } from "@/components/modal/LoadingModal";

const AuthCheckOnly = () => {
  const {
    authState: { hasAuth, pending: authPending },
  } = useAuth();
  const dispatch = useDispatch();

  // ログインしているか、1回でもauthチェックをしている場合はapiを投げない様にする
  const authCheck = () => {
    if (hasAuth === AuthIs.TRUE || hasAuth !== AuthIs.UNDEFINED) return;
    dispatch(fetchAuthUser());
  };

  // 試合情報
  const { matchesState } = useFetchAllMatches();

  useEffect(() => {
    authCheck();
  }, []);
  return authPending || matchesState.pending ? <LoadingModal /> : <Outlet />;
};

export default AuthCheckOnly;
