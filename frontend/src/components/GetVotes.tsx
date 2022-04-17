import { useEffect } from "react";
import axios from "../libs/axios";
import { useSelector, useDispatch } from "react-redux";
import {} from "@/store/slice/allVoteResultSlice";
import { Outlet } from "react-router-dom";

const GetVotes = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {})();
  });

  return <Outlet />;
};

// export default GetVotes;
