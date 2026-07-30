import React, { useState } from 'react';
import { MatchUpdateFormType } from '@/types';
import { FormDataContext, initialFormData } from './FormDataContext';

export const FormDataContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState<MatchUpdateFormType>(initialFormData);
  const value = { formData, setFormData };
  return <FormDataContext.Provider value={value}>{children}</FormDataContext.Provider>;
};
