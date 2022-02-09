import { useDispatch, useSelector } from "react-redux";
import axios, { isAxiosError } from "../../libs/axios";
import { logout, selectUser } from "../../store/slice/authUserSlice";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export const Comments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const out = async () => {
    try {
      await axios.post("api/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
      }
    }
  };

  const { name } = useSelector(selectUser);
  return (
    <>
      <h1>comments</h1>
      <p>{name}さん</p>
      <Button onClick={out}>logout</Button>
      <div>
        <Link className="text-blue-400" to="/">
          Homeへ
        </Link>
      </div>
    </>
  );
};
