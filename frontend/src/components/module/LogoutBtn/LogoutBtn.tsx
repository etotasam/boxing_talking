import React, { useEffect, useRef } from "react";
import { clsx } from "clsx";
//! components
import { Spinner } from "@/components/module/Spinner";
import { CustomButton } from "@/components/atomic/Button";
//! hooks
import { useAuth, useLogout } from "@/libs/hooks/useAuth";
import { useQueryState } from "@/libs/hooks/useQueryState";

const LogoutBtn = (type: string) =>
  function InnerLogoutBtn() {
    const { state: isOpenHamburgerMenu, setter: setIsOpenHamburgerMenu } =
      useQueryState<boolean>("q/isOpenHamburgerMenu");
    const { data: authUser } = useAuth();
    const { logout, isLoading: isLogoutPending } = useLogout();
    const handleClickButton = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      if (!authUser) return;
      logout({ userId: authUser.id });
    };

    //? logout時にHamburgerModalがopenの時は閉じる
    useEffect(() => {
      return () => {
        if (isOpenHamburgerMenu) setIsOpenHamburgerMenu(false);
      };
    }, []);

    const atNormalState = useRef(["text-gray-600", "pointer-events-none", "select-none"]);
    const atPendingState = useRef(["text-white"]);
    switch (type) {
      case "default":
        atNormalState.current = [...atNormalState.current, "bg-green-900"];
        atPendingState.current = [...atPendingState.current, "bg-green-600", "hover:bg-green-500"];
        break;

      case "plain":
        atNormalState.current = [...atNormalState.current, "bg-stone-500"];
        atPendingState.current = [...atPendingState.current, "bg-stone-600", "hover:bg-stone-500"];
    }

    return (
      <div className="relative">
        {isLogoutPending && <Spinner size={20} />}
        <CustomButton
          dataTestid={"logout-button"}
          className={clsx(
            "text-white duration-200",
            isLogoutPending ? atNormalState.current : atPendingState.current
          )}
          onClick={(e) => handleClickButton(e)}
        >
          ログアウト
        </CustomButton>
      </div>
    );
  };

export const DefaultLogoutBtn = LogoutBtn("default");
export const PlainLogoutBtn = LogoutBtn("plain");
