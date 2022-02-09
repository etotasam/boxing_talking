import { useState, useEffect } from "react";
import axios from "../libs/axios";
import {
  selectAuth,
  selectChecked,
  login,
  checked,
} from "../store/slice/authUserSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";

const AuthCheckOnly = () => {
  const isAuth = useSelector(selectAuth);
  const hasAuthChecked = useSelector(selectChecked);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const authCheck = async () => {
    if (isAuth || hasAuthChecked) return setIsLoading(false);
    try {
      const { data } = await axios.get(`/api/user`);
      dispatch(login(data));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
    dispatch(checked());
  };
  useEffect(() => {
    (async () => {
      await authCheck();
    })();
  }, []);
  return isLoading ? <p>Loading...</p> : <Outlet />;
};

export default AuthCheckOnly;
