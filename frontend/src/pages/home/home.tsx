import { useEffect } from "react";
import Button from "../../components/Button";
import axios, { isAxiosError } from "../../libs/axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectAuth } from "../../store/slice/authUserSlice";

export const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { name } = useSelector(selectUser);
  const isAuth = useSelector(selectAuth);

  const MESSAGE = "※コメント閲覧、投稿にはログインが必要です";
  const click = () => {
    if (isAuth) return navigate("/comments");
    navigate("/login", { state: { message: MESSAGE } });
  };

  const getFighters = async () => {
    try {
      const { data } = await axios.post("api/fighter");
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await getFighters();
    })();
  }, []);

  return (
    <>
      <h1>Home</h1>
      {isAuth ? <p>{name}さん</p> : <p>ゲストさん</p>}
      <div>
        <Link className="text-blue-500" to="/login">
          Loginページ
        </Link>
      </div>
      <div
        onClick={click}
        className="flex w-[500px] bg-green-100 cursor-pointer"
      >
        <div className="bg-blue-400 w-1/2">
          <p>inoue</p>
          <p>成績</p>
        </div>
        <div className="bg-red-400 w-1/2">
          <p>lomachenko</p>
          <p>成績</p>
        </div>
      </div>
    </>
  );
};
