import { useState } from "react";
import axios from "@/libs/axios";
import { MESSAGE } from "@/libs/utils";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";

// component
import { FighterEditForm, FighterProfile } from "@/components/module/FighterEditForm";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";

// layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

// hooks
import { useMessageController } from "@/libs/hooks/messageController";

export const FighterRegister = () => {
  const [registerPending, setRegisterPending] = useState(false);
  const register = async (event: React.FormEvent<HTMLFormElement>, inputFighterInfo: FighterProfile) => {
    event.preventDefault();
    setRegisterPending(true);
    try {
      const { data: result } = await axios.post("api/fighter/register", inputFighterInfo);
      setMessageToModal(MESSAGE.FIGHTER_REGISTER_SUCCESS, ModalBgColorType.SUCCESS);
      console.log(result);
    } catch (error) {
      setMessageToModal(MESSAGE.FIGHTER_REGISTER_FAILD, ModalBgColorType.ERROR);
    }
    setRegisterPending(false);
  };

  const { setMessageToModal } = useMessageController();

  return (
    <LayoutForEditPage>
      <div className="min-h-[calc(100vh-50px)] bg-stone-50 flex justify-center items-center">
        <FighterEditForm onSubmit={(event, inputFighterInfo) => register(event, inputFighterInfo)} />
        {registerPending && <FullScreenSpinnerModal />}
      </div>
    </LayoutForEditPage>
  );
};
