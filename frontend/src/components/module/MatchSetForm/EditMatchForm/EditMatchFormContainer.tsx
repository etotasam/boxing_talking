import React from 'react';
import { FormDataContextWrapper } from '../FormDataContextWrapper';
import { EditMatchForm } from './EditMatchForm';
import { MatchDataType } from '@/assets/types';

export const EditMatchFormContainer = (props: {
  selectedMatch: MatchDataType | undefined;
  isSuccessDeleteMatch: boolean;
}) => {
  return (
    <FormDataContextWrapper>
      <EditMatchForm
        selectedMatch={props.selectedMatch}
        isSuccessDeleteMatch={props.isSuccessDeleteMatch}
      />
    </FormDataContextWrapper>
  );
};
