import { useEffect } from 'react';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
//! layout wrapper
import AdminOnlyLayout from '@/layout/AdminOnlyLayout';
// ! types
import { BoxerType } from '@/assets/types';
import { MessageType } from '@/assets/types';
// ! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from '@/assets/statusesOnToastModal';
import { initialBoxerDataOnForm } from '@/assets/boxerData';
//! component
import { BoxerEditForm } from '@/components/module/BoxerEditForm';
//! recoil
import { useRecoilState, useRecoilValue } from 'recoil';
import { boxerCurrentState } from '@/store/boxerCurrentState';
import { elementSizeState } from '@/store/elementSizeState';
//! hooks
import { useToastModal } from '@/hooks/useToastModal';
import { useRegisterBoxer } from '@/hooks/apiHooks/useBoxer';
import { useLoading } from '@/hooks/useLoading';
import { useWindowSize } from '@/hooks/useWindowSize';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const BoxerRegister = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();
  const [boxerCurrentData, setBoxerCurrentData] = useRecoilState(boxerCurrentState);
  const { hideToastModal, showToastModalMessage } = useToastModal();
  const { registerBoxer, isSuccess: successRegisterBoxer } = useRegisterBoxer();

  const { device } = useWindowSize();
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  // ? アンマウント時にはトーストモーダルを隠す
  //? form内データをデフォルトに戻す
  useEffect(() => {
    return () => {
      hideToastModal();
      setBoxerCurrentData(initialBoxerDataOnForm);
    };
  }, []);

  // ? 国の選択なしの場合
  const showModalIfNoSelectCountry = () => {
    if (boxerCurrentData.country === undefined) {
      throw Error(MESSAGE.INVALID_COUNTRY);
    }
  };
  //? 名前が未入力
  const showModelIfNameUndefined = () => {
    if (!boxerCurrentData.name || !boxerCurrentData.engName) {
      throw Error(MESSAGE.BOXER_NAME_UNDEFINED);
    }
  };

  //! formデータのsubmit
  const boxerRegisterDataSubmit = ({
    event,
    newBoxerData,
  }: {
    event: React.FormEvent<HTMLFormElement>;
    newBoxerData: BoxerType;
  }) => {
    event.preventDefault();
    try {
      showModalIfNoSelectCountry();
      showModelIfNameUndefined();

      const { id, ...formattedBoxerDataForUpdate } = boxerCurrentData;
      registerBoxer(formattedBoxerDataForUpdate);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <AdminOnlyLayout>
      <Helmet>
        <title>Boxer登録 | {siteTitle}</title>
      </Helmet>

      <div className={clsx('flex justify-center items-center py-10')}>
        <BoxerEditForm isSuccess={successRegisterBoxer} submitBoxerData={boxerRegisterDataSubmit} />
      </div>
    </AdminOnlyLayout>
  );
};
