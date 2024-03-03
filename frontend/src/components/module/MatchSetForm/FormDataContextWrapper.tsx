import React, { createContext, useState } from 'react';
import dayjs from 'dayjs';
//! type
import { MatchUpdateFormType, OrganizationsType } from '@/assets/types';

const initialFormData: MatchUpdateFormType = {
  matchDate: dayjs().format('YYYY-MM-DD'),
  grade: undefined,
  country: undefined,
  venue: '',
  weight: undefined,
  titles: [] as OrganizationsType[] | [],
} as const;

export const FormDataContext = createContext<{
  formData: MatchUpdateFormType;
  setFormData: React.Dispatch<React.SetStateAction<MatchUpdateFormType>>;
}>({ formData: initialFormData, setFormData: () => {} });

export const FormDataContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState<MatchUpdateFormType>(initialFormData);
  const value = { formData, setFormData };
  return <FormDataContext.Provider value={value}>{children}</FormDataContext.Provider>;
};
