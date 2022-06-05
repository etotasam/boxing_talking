import { useParams } from "react-router-dom";
import { Axios } from "@/libs/axios";

export const UserRegisterwidthVerifyEmail = () => {
  const { token, id } = useParams();
  return (
    <>
      <div>
        <p>token: {token}</p>
        <p>id: {id}</p>
      </div>
    </>
  );
};
