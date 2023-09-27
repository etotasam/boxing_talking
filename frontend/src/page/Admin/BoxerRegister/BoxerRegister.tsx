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
import { initialBoxerDataOnForm } from '@/assets/boxerData';
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
import { identity } from 'lodash';
import { MessageType } from '@/assets/types';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const BoxerRegister = () => {
  // ! use hook
  const { setter: setPagePath } = usePagePath();
  const { resetLoadingState } = useLoading();
  const { pathname } = useLocation();
  const { state: boxerDataOnForm, setter: setEditTargetBoxerData } =
    useBoxerDataOnForm();
  const {
    setToastModal,
    showToastModal,
    hideToastModal,
    showToastModalMessage,
  } = useToastModal();
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
  //? form内データをデフォルトに戻す
  useEffect(() => {
    return () => {
      hideToastModal();
      setEditTargetBoxerData(initialBoxerDataOnForm);
    };
  }, []);

  // ? 国の選択なしの場合
  const showModalIfNoSelectCountry = () => {
    if (boxerDataOnForm.country === undefined) {
      throw Error(MESSAGE.INVALID_COUNTRY);
    }
  };
  //? 名前が未入力
  const showModelIfNameUndefined = () => {
    if (!boxerDataOnForm.name || !boxerDataOnForm.eng_name) {
      throw Error(MESSAGE.BOXER_NAME_UNDEFINED);
    }
  };

  //! formデータのsubmit
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      showModalIfNoSelectCountry();
      showModelIfNameUndefined();

      const { id, ...formattedBoxerDataOnForm } = boxerDataOnForm;
      registerBoxer(formattedBoxerDataOnForm);
    } catch (error: any) {
      if (error.message) {
        showToastModalMessage({
          message: error.message as MessageType,
          bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
        });
      } else {
        console.error('Failed register boxer');
      }
    }
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
