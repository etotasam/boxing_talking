import { useEffect } from "react";
import axios from "../libs/axios";
import { selectAuth, login } from "../store/slice/authUserSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";

const Pro = () => {
  const isAuth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authCheck = async () => {
    if (isAuth) return;
    try {
      const { data } = await axios.get(`/api/user`);
      dispatch(login(data));
    } catch (error) {
      navigate("/login");
    }
  };
  useEffect(() => {
    (async () => {
      await authCheck();
    })();
  });

  return isAuth ? <Outlet /> : <p>Loading...</p>;
};

export default Pro;
