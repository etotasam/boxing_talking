import React from "react";

// components
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { CustomButton } from "@/components/atomic/Button";

// hooks
// import { useLogout } from "@/libs/hooks/useLogout";
import { useAuth, useLogout } from "@/libs/hooks/useAuth";

export const LogoutBtn = React.memo(() => {
  const { data: authUser } = useAuth();
  // const { logout, logoutState } = useLogout();
  const { logout, isLoading: isLogoutPending } = useLogout();
  const click = async () => {
    if (!authUser) return;
    logout({ userId: authUser.id });
  };

  return (
    <div className="relative">
      {isLogoutPending && <SpinnerModal />}
      <CustomButton
        dataTestid={"logout-button"}
        className={`text-white ${
          isLogoutPending
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
