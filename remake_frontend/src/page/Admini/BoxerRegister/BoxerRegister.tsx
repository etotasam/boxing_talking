import _ from "lodash";
// ! data
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from "@/assets/statusesOnToastModal";
//! component
import { BoxerEditForm } from "@/components/module/BoxerEditForm";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
//! hooks
import { useBoxerDataOnForm } from "@/hooks/useBoxerDataOnForm";
import { useToastModal } from "@/hooks/useToastModal";
import { useRegisterBoxer } from "@/hooks/useBoxer";
import { BoxerType } from "@/assets/types";

export const BoxerRegister = () => {
  // ! use hook
  const { state: boxerDataOnForm, setter: setBoxerDataToForm } =
    useBoxerDataOnForm();
  const { setToastModal } = useToastModal();
  const { registerBoxer } = useRegisterBoxer();

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
      return;
    }

    const copy_boxerDataOnForm = JSON.parse(JSON.stringify(boxerDataOnForm));
    const { title_hold } = boxerDataOnForm;
    if (title_hold.length) {
      const titlesArray = title_hold
        .filter((obj) => {
          return (
            obj?.organization !== undefined && obj?.weightClass !== undefined
          );
        })
        .map((titleData) => {
          return `${titleData.organization}世界${titleData.weightClass}級王者`;
        });

      copy_boxerDataOnForm.title_hold = titlesArray;

      // setBoxerDataToForm((curr) => {
      //   return { ...curr, title_hold: titlesArray };
      // });
    }

    registerBoxer(copy_boxerDataOnForm as BoxerType);
  };

  return (
    <AdminiLayout>
      <div className="min-h-[calc(100vh-100px)] flex justify-center items-center">
        <BoxerEditForm
          // isSuccessRegisterFighter={isSuccessRegisterFighter}
          onSubmit={onSubmit}
        />
        {/* {isRegisterFighterPending && <FullScreenSpinnerModal />} */}
      </div>
    </AdminiLayout>
  );
};
