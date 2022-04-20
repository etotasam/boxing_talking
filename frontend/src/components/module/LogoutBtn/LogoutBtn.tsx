import React from "react";
import { useNavigate } from "react-router-dom";

// components
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { CustomButton } from "@/components/atomic/Button";

// hooks
import { useLogout } from "@/libs/hooks/useLogout";

export const LogoutBtn = React.memo(() => {
  const navigate = useNavigate();
  const { logout, logoutState } = useLogout();
  const click = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="relative">
      {logoutState.pending && <SpinnerModal />}
      <CustomButton
        dataTestid={"logout-button"}
        className={`text-white ${
          logoutState.pending
            ? `bg-green-900 text-gray-600 pointer-events-none select-none`
            : `bg-green-600 hover:bg-green-500 text-white`
        } duration-200`}
        onClick={click}
      >
        Logout
      </CustomButton>
    </div>
  );
});
