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
import { useRegisterFighter, useFetchFighters } from "@/libs/hooks/useFighter";
import { queryKeys } from "@/libs/queryKeys";
import { useQueryState } from "@/libs/hooks/useQueryState";

//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

export const FighterRegister = () => {
  // const queryClient = useQueryClient();
  const { registerFighter, isLoading: isRegisterFighterPending } = useRegisterFighter();
  const { setToastModalMessage } = useToastModal();
  const { data: fightersData } = useFetchFighters();
  const { getLatestState: getLatestFighterDataFromForm, setter: setFighterDataFromForm } =
    useQueryState<FighterType>(queryKeys.fighterEditData);

  const register = async () => {
    const fighterDataForRegistration = getLatestFighterDataFromForm();
    //? 選手がすでに存在しているかをチェック(チェックしてるのは名前だけ)
    const hasThatFighterOnDB = fightersData?.some(
      (fighter) => fighter.name === fighterDataForRegistration!.name
    );
    if (hasThatFighterOnDB) {
      return setToastModalMessage({
        message: MESSAGE.FIGHTER_NOT_ABLE_TO_REGISTER,
        bgColor: ModalBgColorType.NOTICE,
      });
    }
    registerFighter(fighterDataForRegistration!);
  };

  useEffect(() => {
    return () => {
      setFighterDataFromForm(initialFighterInfoState);
    };
  }, []);

  return (
    <LayoutForEditPage>
      <div className="min-h-[calc(100vh-50px)] bg-stone-50 flex justify-center items-center">
        <FighterEditForm onSubmit={register} />
        {isRegisterFighterPending && <FullScreenSpinnerModal />}
      </div>
    </LayoutForEditPage>
  );
};
