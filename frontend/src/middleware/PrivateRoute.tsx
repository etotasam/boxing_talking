import { useEffect } from "react";
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
import { selectMatches, fetchMatches } from "@/store/slice/matchesSlice";
import {
  UserVoteStateType,
  selectVotes,
  fetchUserVotes,
  selectUserVotesLoading,
} from "@/store/slice/userVoteSlice";

const PrivateRoute = () => {
  const isAuth: AuthIs = useSelector(selectAuth);
  const authUser = useSelector(selectUser);
  const getingAuthuser = useSelector(selectAuthUserLoading);
  const allMatches = useSelector(selectMatches);
  const getingUserVotes = useSelector(selectUserVotesLoading);
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

  const getMatches = async () => {
    if (allMatches) return;
    dispatch(fetchMatches());
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
    authCheck();
    getMatches();
  }, []);
  useEffect(() => {
    if (isNaN(authUser.id)) return;
    getUserVotes(authUser);
  }, [authUser]);

  return !getingAuthuser && !getingUserVotes && isMatches ? (
    <Outlet />
  ) : (
    <p>gating data...</p>
  );
  // return isAuth && isMatches ? <Outlet /> : <p>テスト...</p>;
};

export default PrivateRoute;
