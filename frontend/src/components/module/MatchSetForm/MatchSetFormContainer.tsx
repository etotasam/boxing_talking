import React, { useState, useEffect, useCallback, useContext } from 'react';
import dayjs from 'dayjs';
import { MatchSetForm } from './MatchSetForm';
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from '@/assets/statusesOnToastModal';
import { cloneDeep } from 'lodash';
//! type
import { OrganizationsType } from '@/assets/types';
//! hook
import { useToastModal } from '@/hooks/useToastModal';
//! data
import { GRADE } from '@/assets/boxerData';
//!type evolution
import { isMessageType } from '@/assets/typeEvaluations';
//! context
import { FormDataContext } from './FormDataContextWrapper';

export const MatchSetFormContainer = (props: { onSubmit: () => void; title?: boolean }) => {
  const { onSubmit, title } = props;

  const { hideToastModal, showToastModalMessage } = useToastModal();

  const { formData, setFormData } = useContext(FormDataContext);
  const [isTitle, setIsTitle] = useState(title ?? false);

  // ? アンマウント時にはトーストモーダルを隠す
  useEffect(() => {
    return () => {
      hideToastModal();
    };
  }, []);

  //?グレードがタイトルマッチ以外の時はorganization(WBA,WBCとか…)を選べない様にする
  useEffect(() => {
    if (formData.grade === GRADE.TITLE_MATCH) {
      setIsTitle(true);
    } else {
      setIsTitle(false);
    }
  }, [formData.grade]);

  // ? 未入力がある場合はモーダルでNOTICE
  const showModalIfUndefinedFieldsExist = () => {
    if (Object.values(formData).some((value) => !!value === false)) {
      throw new Error(MESSAGE.MATCH_HAS_NOT_ENTRIES);
    } else if (formData.grade === GRADE.TITLE_MATCH && !formData.titles.length) {
      throw new Error(MESSAGE.MATCH_HAS_NOT_ENTRIES);
    }
  };

  const submitInterceptor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      showModalIfUndefinedFieldsExist();

      onSubmit();
    } catch (error: unknown) {
      const e = error as Error;
      if (isMessageType(e.message) && e.message) {
        showToastModalMessage({
          message: e.message,
          bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
        });
      } else {
        console.error('Has error when match update', error);
      }
    }
  };

  const onChangeTitle = useCallback((title: OrganizationsType, index: number): void => {
    setFormData((current) => {
      const cloneCurrent = cloneDeep(current);
      cloneCurrent.titles[index] = title;
      const titles = cloneCurrent.titles.filter((v) => !!v);
      return { ...current, titles };
    });
  }, []);

  //? 各種formデータの更新
  const onChange = <T,>(value: Record<string, T>): void => {
    setFormData((current) => {
      return {
        ...current,
        ...value,
      };
    });
  };

  return (
    <MatchSetForm
      onChange={onChange}
      onChangeTitle={onChangeTitle}
      onSubmit={submitInterceptor}
      formData={formData}
      isTitle={isTitle}
    />
  );
};
