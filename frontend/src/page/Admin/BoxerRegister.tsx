import { useEffect } from 'react';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { initialBoxerDataOnForm } from '@/constants/boxerData';
import { BoxerEditForm } from '@/components/module/BoxerEditForm';
import { useRecoilState } from 'recoil';
import { boxerCurrentState } from '@/store/boxerCurrentState';
import { useToastModal } from '@/hooks/useToastModal';
import { useRegisterBoxer } from '@/hooks/apiHooks/boxer';
import { useBoxerFieldData } from '@/hooks/useBoxerFieldData';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const BoxerRegister = () => {
  const [boxerCurrentData, setBoxerCurrentData] = useRecoilState(boxerCurrentState);
  const { hideToastModal, showErrorToast } = useToastModal();
  const { registerBoxer, isSuccess: successRegisterBoxer } = useRegisterBoxer();
  const { setBoxerFieldData } = useBoxerFieldData();

  //? 初期設定(クリーンアップとか)
  //     resetLoadingState();

  // ? アンマウント時にはトーストモーダルを隠す
  //? form内データをデフォルトに戻す
  useEffect(() => {
    return () => {
      hideToastModal();
      setBoxerCurrentData(initialBoxerDataOnForm);
    };
  }, []);

  const boxerRegisterDataSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!boxerCurrentData.country) {
      showErrorToast(MESSAGE.INVALID_COUNTRY);
      return;
    }
    const isBoxerNameUndefined = !boxerCurrentData.name || !boxerCurrentData.engName;
    if (isBoxerNameUndefined) {
      showErrorToast(MESSAGE.BOXER_NAME_UNDEFINED);
      return;
    }

    const { id: _id, ...formattedBoxerDataForRegister } = boxerCurrentData;
    registerBoxer(formattedBoxerDataForRegister);
  };

  return (
    <>
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
    </>
  );
};
