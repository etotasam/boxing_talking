import React from "react";
import Button from "../Button";
import { useLogout } from "@/libs/hooks/useLogout";
import { useNavigate } from "react-router-dom";

type Props = {
  className: string;
};

export const LogoutBtn = React.memo(({ className }: Partial<Props>) => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const click = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Button data_testid={"logout-button"} onClick={click} className={className}>
      Logout
    </Button>
  );
});
