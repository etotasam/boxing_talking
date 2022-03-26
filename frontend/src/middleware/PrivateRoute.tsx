import { useEffect } from "react";
import axios from "../libs/axios";
import {
  selectAuth,
  selectUser,
  selectAuthUserLoading,
  AuthIs,
  fetchAuthUser,
  UserType,
} from "@/store/slice/authUserSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import { selectMatches } from "@/store/slice/matchesSlice";
import {
  UserVoteStateType,
  setVotes,
  selectVotes,
  fetchUserVotes,
  selectUserVotesError,
  selectUserVotesLoading,
} from "@/store/slice/userVoteSlice";

const PrivateRoute = () => {
  const isAuth: AuthIs = useSelector(selectAuth);
  const authUser = useSelector(selectUser);
  const loading = useSelector(selectAuthUserLoading);
  const userVotesLoading = useSelector(selectUserVotesLoading);
  const isMatches = useSelector(selectMatches);
  const userVotes = useSelector(selectVotes);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const checkUserVotesId = (
    userVotes: UserVoteStateType[] | undefined
  ): boolean => {
    if (userVotes === undefined) return false;
    const userVotesId = userVotes[0].user_id;
    const authUserId = authUser.id;
    return userVotesId === authUserId;
  };

  const checkTypeUserVoteState = (
    el: (false | UserVoteStateType)[]
  ): el is UserVoteStateType[] => {
    const result = el.filter((e) => e === false);
    return result.length === 0;
  };
  //! ログインチェック
  const authCheck = async () => {
    if (isAuth === AuthIs.TRUE) return;
    try {
      const value: any = await dispatch(fetchAuthUser());
      if (isNaN(value.payload.id)) throw Error;
    } catch (error) {
      navigate("/login");
    }
  };

  const getUserVotes = async (authUser: UserType) => {
    if (checkUserVotesId(userVotes)) return;
    try {
      dispatch(fetchUserVotes(authUser));
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    (async () => {
      await authCheck();
    })();
  }, []);
  useEffect(() => {
    if (isNaN(authUser.id)) return;
    (async () => {
      await getUserVotes(authUser);
    })();
  }, [authUser]);

  return !loading && !userVotesLoading && isMatches ? (
    <Outlet />
  ) : (
    <p>{loading ? "うんこ" : userVotesLoading ? "ゆーざ" : "何もないよ"}</p>
  );
  // return isAuth && isMatches ? <Outlet /> : <p>テスト...</p>;
};

export default PrivateRoute;
