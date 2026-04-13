import { useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import { MESSAGE } from '@/constants/statusesOnToastModal';
//! type
import { MatchFormDataType, OrganizationsType } from '@/types';
//! hook
import { useToastModal } from '@/hooks/useToastModal';
import { useRegisterMatch } from '@/hooks/apiHooks/useMatch';
//! component
import { MatchSetFormContainer } from '../MatchSetFormContainer';
//! context
import { FormDataContextWrapper } from '../context/FormDataContextWrapper';
import { FormDataContext } from '../context/FormDataContext';

type RegisterMatchFormType = {
  boxers: Record<'redBoxerId' | 'blueBoxerId', number | undefined>;
  resetSelectedBoxers: () => void;
};
const RegisterMatchForm = (props: RegisterMatchFormType) => {
  const { boxers, resetSelectedBoxers } = props;
  const { showNoticeToast } = useToastModal();
  const { registerMatch, isSuccess: isSuccessRegisterMatch } = useRegisterMatch();

  const initialFormData = {
    matchDate: dayjs().format('YYYY-MM-DD'),
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

  type RegisterMatchType = Record<'redBoxerId' | 'blueBoxerId', number | undefined> &
    MatchFormDataType;

  //? 試合登録
  const register = () => {
    // ? 選手を選択していない場合モーダルでNOTICE
    const isNotSelectedBoxers = Object.values(boxers).includes(undefined);
    if (isNotSelectedBoxers) {
      showNoticeToast(MESSAGE.MATCH_NOT_SELECTED_BOXER);
      return;
    }

    const matchData: RegisterMatchType = {
      redBoxerId: boxers.redBoxerId!,
      blueBoxerId: boxers.blueBoxerId!,
      ...formData,
    };

    registerMatch(matchData);
  };

  return <MatchSetFormContainer onSubmit={register} />;
};

export const RegisterMatchFormWrapper = ({
  boxers,
  resetSelectedBoxers,
}: RegisterMatchFormType) => {
  return (
    <FormDataContextWrapper>
      <RegisterMatchForm boxers={boxers} resetSelectedBoxers={resetSelectedBoxers} />
    </FormDataContextWrapper>
  );
};
