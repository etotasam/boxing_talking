import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectMatches, fetchMatches } from "@/store/slice/matchesSlice";
import { Outlet } from "react-router-dom";

const GetMatches = () => {
  const dispatch = useDispatch();
  const allMatches = useSelector(selectMatches);

  //! 試合データの取得
  const getMatches = async (): Promise<void> => {
    if (allMatches) return;
    dispatch(fetchMatches());
  };

  useEffect(() => {
    (async () => {
      await getMatches();
    })();
  });

  // return allMatches ? <Outlet /> : <div>よみこみ....</div>;
  return <Outlet />;
};

export default GetMatches;
