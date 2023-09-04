import { useLocation, useNavigate } from "react-router-dom";
//! type
import { BoxerType } from "@/assets/types";
//! component
import { BoxerEditForm } from "@/components/module/BoxerEditForm";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
//! layout
import { AdminiLayout } from "@/layout/AdminiLayout";
//! cutom hooks
// import { useRegisterFighter } from "@/libs/hooks/useFighter";

export const BoxerRegister = () => {
  const location = useLocation();

  // const {
  //   registerFighter,
  //   isLoading: isRegisterFighterPending,
  //   isSuccess: isSuccessRegisterFighter,
  // } = useRegisterFighter();

  //? 新しいボクサーの登録実行
  // const register = async (newFighterData: FighterType) => {
  //   registerFighter(newFighterData);
  // };

  return (
    <AdminiLayout>
      <div className="min-h-[calc(100vh-100px)] flex justify-center items-center">
        <BoxerEditForm
          // isSuccessRegisterFighter={isSuccessRegisterFighter}
          onSubmit={() => {}}
        />
        {/* {isRegisterFighterPending && <FullScreenSpinnerModal />} */}
      </div>
    </AdminiLayout>
  );
};
