import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";
// import { useQueryClient } from "react-query";
import { initialFighterInfoState } from "@/components/module/FighterEditForm";
import { useEffect } from "react";
//! type
import { FighterType } from "@/libs/hooks/fetchers";

//! component
import { FighterEditForm } from "@/components/module/FighterEditForm";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";

//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

//! cutom hooks
import { useRegisterFighter, useFetchFighters } from "@/libs/hooks/useFighter";
import { useMessageController } from "@/libs/hooks/messageController";
import { queryKeys } from "@/libs/queryKeys";
import { useQueryState } from "@/libs/hooks/useQueryState";

export const FighterRegister = () => {
  // const queryClient = useQueryClient();
  const { registerFighter, isLoading: isRegisterFighterPending } = useRegisterFighter();
  const { setMessageToModal } = useMessageController();
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
      return setMessageToModal(MESSAGE.FIGHTER_NOT_ABLE_TO_REGISTER, ModalBgColorType.NOTICE);
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
