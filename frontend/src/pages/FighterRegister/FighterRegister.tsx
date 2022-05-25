import { initialFighterInfoState } from "@/components/module/FighterEditForm";
import { useEffect } from "react";
//! type
import { FighterType } from "@/libs/hooks/useFighter";
//! component
import { FighterEditForm } from "@/components/module/FighterEditForm";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";
//! cutom hooks
import { useRegisterFighter } from "@/libs/hooks/useFighter";
import { queryKeys } from "@/libs/queryKeys";
import { useQueryState } from "@/libs/hooks/useQueryState";

export const FighterRegister = () => {
  const {
    registerFighter,
    isLoading: isRegisterFighterPending,
    isSuccess: isRegisteredFighter,
  } = useRegisterFighter();

  //? fighterEditFormのデータ
  const { state: fighterRegisterData, setter: setFighterRegisterData } = useQueryState<FighterType>(
    queryKeys.fighterEditData,
    initialFighterInfoState
  );
  //? unMount時にformのデータを初期化
  useEffect(() => {
    return () => {
      setFighterRegisterData(initialFighterInfoState);
    };
  }, []);

  const register = async () => {
    registerFighter(fighterRegisterData);
  };

  //? 登録が成功したらformのデータを初期化
  useEffect(() => {
    if (!isRegisteredFighter) return;
    setFighterRegisterData(initialFighterInfoState);
  }, [isRegisteredFighter]);

  return (
    <LayoutForEditPage>
      <div className="min-h-[calc(100vh-50px)] bg-stone-50 flex justify-center items-center">
        <FighterEditForm fighterData={initialFighterInfoState} onSubmit={register} />
        {isRegisterFighterPending && <FullScreenSpinnerModal />}
      </div>
    </LayoutForEditPage>
  );
};
