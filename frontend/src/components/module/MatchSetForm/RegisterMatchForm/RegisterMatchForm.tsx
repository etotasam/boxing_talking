import { useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from '@/assets/statusesOnToastModal';
//! type
import { MatchFormDataType, OrganizationsType } from '@/assets/types';
//! hook
import { useToastModal } from '@/hooks/useToastModal';
import { useRegisterMatch } from '@/hooks/apiHooks/useMatch';
//!context
import { FormDataContext } from '../FormDataContextWrapper';
//!type evolution
import { isMessageType } from '@/assets/typeEvaluations';
//! component
import { MatchSetFormContainer } from '../MatchSetFormContainer';
//! context
import { FormDataContextWrapper } from '../FormDataContextWrapper';

type RegisterMatchFormType = {
  boxers: Record<'red_boxer_id' | 'blue_boxer_id', number | undefined>;
  resetSelectedBoxers: () => void;
};
const RegisterMatchForm = (props: RegisterMatchFormType) => {
  const { boxers, resetSelectedBoxers } = props;
  const { showToastModalMessage } = useToastModal();
  const { registerMatch, isSuccess: isSuccessRegisterMatch } =
    useRegisterMatch();

  const initialFormData = {
    match_date: dayjs().format('YYYY-MM-DD'),
    grade: undefined,
    country: undefined,
    venue: '',
    weight: undefined,
    titles: [] as OrganizationsType[] | [],
  } as const;
  const { formData, setFormData } = useContext(FormDataContext);

  useEffect(() => {
    if (isSuccessRegisterMatch) {
      setFormData(initialFormData);
      resetSelectedBoxers();
    }
  }, [isSuccessRegisterMatch]);

  // ? 選手を選択していない場合モーダルさせるexception throw
  const showModalNotSelectedBoxers = () => {
    if (Object.values(boxers).includes(undefined)) {
      throw new Error(MESSAGE.MATCH_NOT_SELECTED_BOXER);
    }
  };

  type RegisterMatchType = Record<
    'red_boxer_id' | 'blue_boxer_id',
    number | undefined
  > &
    MatchFormDataType;

  //? 試合登録
  const register = () => {
    // ? 選手を選択していない場合モーダルでNOTICE
    try {
      showModalNotSelectedBoxers();

      const matchData: RegisterMatchType = {
        red_boxer_id: boxers.red_boxer_id!,
        blue_boxer_id: boxers.blue_boxer_id!,
        ...formData,
      };

      registerMatch(matchData);
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

  return <MatchSetFormContainer onSubmit={register} />;
};

export const RegisterMatchFormWrapper = ({
  boxers,
  resetSelectedBoxers,
}: RegisterMatchFormType) => {
  return (
    <FormDataContextWrapper>
      <RegisterMatchForm
        boxers={boxers}
        resetSelectedBoxers={resetSelectedBoxers}
      />
    </FormDataContextWrapper>
  );
};
