import axios from "@/libs/axios";

const logout = async () => {
  const { data } = await axios.post("/api/logout");
  return data;
};

export default logout;
