import React, { useEffect, useState } from 'react';
import { isEqual } from 'lodash';
import { cloneDeep } from 'lodash';
// ! data
import { STANCE, initialBoxerDataOnForm } from '@/assets/boxerData';
import { ORGANIZATIONS, WEIGHT_CLASS } from '@/assets/boxerData';
import { COUNTRY } from '@/assets/nationalFlagData';
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from '@/assets/statusesOnToastModal';

//! type
import {
  BoxerType,
  MessageType,
  CountryType,
  StanceType,
  OrganizationsType,
  WeightClassType,
} from '@/assets/types';
//! recoil
import { SetterOrUpdater, useRecoilState } from 'recoil';
import { boxerCurrentState } from '@/store/boxerCurrentState';
// ! component
import { Button } from '@/components/atomic/Button';
//! fields components
import { Name, Country, Birth, Height, Reach, Stance, BoxerResume, Titles } from './fields';
//! hooks
import { useToastModal } from '@/hooks/useToastModal';
import { useUpdateBoxerData } from '@/hooks/apiHooks/useBoxer';

type PropsType = {
  submitBoxerData: ({
    event,
    newBoxerData,
  }: {
    event: React.FormEvent<HTMLFormElement>;
    newBoxerData: BoxerType;
  }) => void;
  isPending?: boolean;
  isSuccess?: boolean;
  isGuard?: boolean;
};

export type LocalDataEntryType = <k extends keyof BoxerType>(
  boxerDataKey: k,
  value: BoxerType[k]
) => void;

export const BoxerEditForm = (props: PropsType) => {
  //! use hook
  const { hideToastModal, showToastModalMessage } = useToastModal();

  // ? recoil(boxerデータのmaster)
  const [boxerCurrentData, setBoxerCurrentData] = useRecoilState(boxerCurrentState);
  // console.log(boxerCurrentData.win);

  // ? boxerデータをコンポーネント内でのみ管理
  const [localBoxerData, setLocalBoxerData] = useState<BoxerType>(boxerCurrentData);
  useEffect(() => {
    setLocalBoxerData(boxerCurrentData);
  }, [boxerCurrentData]);

  //TODO 登録成功時にformデータを初期化する処理
  //! これはちょっと強引なやり方だよね・・・
  useEffect(() => {
    setBoxerCurrentData(localBoxerData);
  }, [props.isSuccess]);

  const changeLocalBoxerData = <k extends keyof BoxerType>(
    boxerDataKey: k,
    value: BoxerType[k]
  ) => {
    setLocalBoxerData((current) => {
      return { ...current, [boxerDataKey]: value };
    });
  };

  //? 国籍が選択されていない場合
  const showModalIfNoSelectCountry = () => {
    if (localBoxerData.country === undefined) {
      throw Error(MESSAGE.INVALID_COUNTRY);
    }
  };
  //? 名前が未入力
  const showModelIfNameUndefined = () => {
    if (!localBoxerData.name || !localBoxerData.engName) {
      throw Error(MESSAGE.BOXER_NAME_UNDEFINED);
    }
  };
  // TODO 必要なデータが入力されているかのチェック関数
  //? onSubmit時のinterceptor(localBoxerDataに入力漏れなどがないかをチェックする関数)
  const handleSubmitInterceptor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!localBoxerData) return console.error('No Have Boxer Data');
    try {
      // showModalIfNoSelectCountry();
      showModelIfNameUndefined();
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToastModalMessage({
          message: error.message as MessageType,
          bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
        });
      } else {
        console.error('Failed register boxer');
      }
    }

    const requiredFields: (keyof BoxerType)[] = ['name', 'engName', 'country', 'birth'];
    const missingFields = requiredFields.filter((field) => !localBoxerData[field]);

    props.submitBoxerData({ event: e, newBoxerData: localBoxerData });
  };

  //? 登録が完了したらformのデータを初期化
  // useEffect(() => {
  //   if (!props.isSuccess) return;
  //   setBoxerCurrentData(initialBoxerDataOnForm);
  // }, [props.isSuccess]);

  return (
    <div className="p-10 bg-stone-200 border-stone-400 border-[1px]">
      <h1 className="text-3xl text-center">選手情報</h1>
      <form className="flex flex-col" onSubmit={handleSubmitInterceptor}>
        <Name
          boxerName={{ name: localBoxerData.name, engName: localBoxerData.engName }}
          changeLocalBoxerData={changeLocalBoxerData}
        />
        <Country
          boxersCountry={localBoxerData.country}
          changeLocalBoxerData={changeLocalBoxerData}
        />

        <Birth birth={localBoxerData.birth} changeLocalBoxerData={changeLocalBoxerData} />
        <Height boxerHeight={localBoxerData.height} changeLocalBoxerData={changeLocalBoxerData} />
        <Reach boxerReach={localBoxerData.reach} changeLocalBoxerData={changeLocalBoxerData} />
        <Stance stance={localBoxerData.style} changeLocalBoxerData={changeLocalBoxerData} />
        <BoxerResume
          resume={{
            win: localBoxerData.win,
            ko: localBoxerData.ko,
            draw: localBoxerData.draw,
            lose: localBoxerData.lose,
          }}
          changeLocalBoxerData={changeLocalBoxerData}
        />
        <Titles titles={localBoxerData.titles} changeLocalBoxerData={changeLocalBoxerData} />
        <div className="relative mt-5">
          <Button styleName={'wide'}>登録</Button>
        </div>
      </form>
    </div>
  );
};

type DataEntryItemType = {
  boxerCurrentData: BoxerType;
  setBoxerCurrentData: SetterOrUpdater<BoxerType>;
};
