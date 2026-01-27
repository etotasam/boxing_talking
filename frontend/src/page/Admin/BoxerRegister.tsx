import { useEffect } from 'react';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
//! layout wrapper
import AdminOnlyLayout from '@/layout/AdminOnlyLayout';
// ! data
import { MESSAGE } from '@/assets/statusesOnToastModal';
import { initialBoxerDataOnForm } from '@/assets/boxerData';
//! component
import { BoxerEditForm } from '@/components/module/BoxerEditForm';
//! recoil
import { useRecoilState } from 'recoil';
import { boxerCurrentState } from '@/store/boxerCurrentState';
//! hooks
import { useToastModal } from '@/hooks/useToastModal';
import { useRegisterBoxer } from '@/hooks/apiHooks/useBoxer';
import { useLoading } from '@/hooks/useLoading';
import { useBoxerFieldData } from '@/hooks/useBoxerFieldData';
import { useShowErrorToast } from '@/hooks/useShowErrorToast';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const BoxerRegister = () => {
  // ! use hook
  const { resetLoadingState } = useLoading();
  const [boxerCurrentData, setBoxerCurrentData] = useRecoilState(boxerCurrentState);
  const { hideToastModal } = useToastModal();
  const { registerBoxer, isSuccess: successRegisterBoxer } = useRegisterBoxer();
  const { showErrorToast } = useShowErrorToast();

  const { setBoxerFieldData } = useBoxerFieldData();

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

  //! formデータのsubmit
  const boxerRegisterDataSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (showErrorToast(!boxerCurrentData.country, MESSAGE.INVALID_COUNTRY)) return;
    if (
      showErrorToast(
        !boxerCurrentData.name || !boxerCurrentData.engName,
        MESSAGE.BOXER_NAME_UNDEFINED
      )
    )
      return;

    const { id, ...formattedBoxerDataForUpdate } = boxerCurrentData;
    registerBoxer(formattedBoxerDataForUpdate);
  };

  return (
    <AdminOnlyLayout>
      <Helmet>
        <title>Boxer登録 | {siteTitle}</title>
      </Helmet>

      <div className={clsx('flex justify-center items-center py-10')}>
        <BoxerEditForm
          isSuccess={successRegisterBoxer}
          setBoxerFieldData={setBoxerFieldData}
          submitBoxerData={boxerRegisterDataSubmit}
          boxerCurrentData={boxerCurrentData}
        />
      </div>
    </AdminOnlyLayout>
  );
};
