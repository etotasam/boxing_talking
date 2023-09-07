import _ from "lodash";
// ! data
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from "@/assets/statusesOnToastModal";
//! component
import { BoxerEditForm } from "@/components/module/BoxerEditForm";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
//! hooks
import { useBoxerDataOnForm } from "@/hooks/useBoxerDataOnForm";
import { useToastModal } from "@/hooks/useToastModal";
import { useRegisterBoxer } from "@/hooks/useBoxer";
import { BoxerType } from "@/assets/types";
import { useEffect } from "react";

export const BoxerRegister = () => {
  // ! use hook
  const { state: boxerDataOnForm, setter: setBoxerDataToForm } =
    useBoxerDataOnForm();
  const { setToastModal, showToastModal, hideToastModal } = useToastModal();
  const { registerBoxer, isSuccess: successRegisterBoxer } = useRegisterBoxer();

  // ? アンマウント時にはトーストモーダルを隠す
  useEffect(() => {
    return () => {
      hideToastModal();
    };
  }, []);
  //! formデータのsubmit
  /**
   * sendData
   * @param e Event
   * @returns void
   */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ? 国の選択なしの場合
    if (boxerDataOnForm.country === undefined) {
      setToastModal({
        message: MESSAGE.INVALID_COUNTRY,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }
    //? 名前が未入力
    if (!boxerDataOnForm.name || !boxerDataOnForm.eng_name) {
      setToastModal({
        message: MESSAGE.BOXER_NAME_UNDEFINED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
      });
      showToastModal();
      return;
    }

    registerBoxer(boxerDataOnForm);
  };

  return (
    <AdminiLayout>
      <div className="min-h-[calc(100vh-100px)] flex justify-center items-center">
        <BoxerEditForm isSuccess={successRegisterBoxer} onSubmit={onSubmit} />
      </div>
    </AdminiLayout>
  );
};
