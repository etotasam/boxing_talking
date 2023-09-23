import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// ! types
// import { BoxerType } from "@/assets/types";
// ! data
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from '@/assets/statusesOnToastModal';
//! component
import { BoxerEditForm } from '@/components/module/BoxerEditForm';
//! layout
import AdminLayout from '@/layout/AdminLayout';
//! hooks
import { usePagePath } from '@/hooks/usePagePath';
import { useBoxerDataOnForm } from '@/hooks/useBoxerDataOnForm';
import { useToastModal } from '@/hooks/useToastModal';
import { useRegisterBoxer } from '@/hooks/useBoxer';
import { useLoading } from '@/hooks/useLoading';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const BoxerRegister = () => {
  // ! use hook
  const { setter: setPagePath } = usePagePath();
  const { resetLoadingState } = useLoading();
  const { pathname } = useLocation();
  const { state: boxerDataOnForm } = useBoxerDataOnForm();
  const { setToastModal, showToastModal, hideToastModal } = useToastModal();
  const { registerBoxer, isSuccess: successRegisterBoxer } = useRegisterBoxer();

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

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
    <AdminLayout>
      <Helmet>
        <title>Boxer登録 | {siteTitle}</title>
      </Helmet>
      <div className="min-h-[calc(100vh-100px)] flex justify-center items-center">
        <BoxerEditForm isSuccess={successRegisterBoxer} onSubmit={onSubmit} />
      </div>
    </AdminLayout>
  );
};
