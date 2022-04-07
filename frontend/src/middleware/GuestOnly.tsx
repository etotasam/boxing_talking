import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useHasAuth,
  useAuthUserLoading,
  fetchAuthUser,
  AuthIs,
} from "@/store/slice/authUserSlice";
import { useEffect } from "react";

const GuestOnly = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth: AuthIs = useHasAuth();
  const loading = useAuthUserLoading();

  const authCheck = async () => {
    if (isAuth === AuthIs.TRUE) return navigate("/");
    if (isAuth === AuthIs.FALSE) return;
    const value: any = await dispatch(fetchAuthUser());
    if (!value.payload) return;
    if (!isNaN(value.payload.id)) return navigate("/");
  };
  useEffect(() => {
    authCheck();
  }, []);
  return loading ? <div>loading test...</div> : <Outlet />;
};

export default GuestOnly;
