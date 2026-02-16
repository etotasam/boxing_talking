import React, { useState } from 'react';
//! type
import { MatchUpdateFormType } from '@/types';
//! context
import { FormDataContext, initialFormData } from './FormDataContext';

export const FormDataContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState<MatchUpdateFormType>(initialFormData);
  const value = { formData, setFormData };
  return <FormDataContext.Provider value={value}>{children}</FormDataContext.Provider>;
};
