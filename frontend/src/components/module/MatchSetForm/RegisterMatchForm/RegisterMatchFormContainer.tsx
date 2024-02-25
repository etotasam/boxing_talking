import React from 'react';
import { RegisterMatchForm } from './RegisterMatchForm';
import { FormDataContextWrapper } from '../FormDataContextWrapper';

export const RegisterMatchFormContainer = ({
  boxers,
  resetSelectedBoxers,
}: {
  boxers: Record<'red_boxer_id' | 'blue_boxer_id', number | undefined>;
  resetSelectedBoxers: () => void;
}) => {
  return (
    <FormDataContextWrapper>
      <RegisterMatchForm
        boxers={boxers}
        resetSelectedBoxers={resetSelectedBoxers}
      />
    </FormDataContextWrapper>
  );
};
