//! type
import { FighterType } from "@/libs/hooks/useFighter";
//! component
import { FighterEditForm } from "@/components/module/FighterEditForm";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";
//! cutom hooks
import { useRegisterFighter } from "@/libs/hooks/useFighter";

export const FighterRegister = () => {
  const {
    registerFighter,
    isLoading: isRegisterFighterPending,
    isSuccess: isSuccessRegisterFighter,
  } = useRegisterFighter();

  //? 新しいボクサーの登録実行
  const register = async (newFighterData: FighterType) => {
    registerFighter(newFighterData);
  };

  return (
    <LayoutForEditPage>
      <div className="min-h-[calc(100vh-50px)] bg-stone-50 flex justify-center items-center">
        <FighterEditForm isSuccessRegisterFighter={isSuccessRegisterFighter} onSubmit={register} />
        {isRegisterFighterPending && <FullScreenSpinnerModal />}
      </div>
    </LayoutForEditPage>
  );
};
