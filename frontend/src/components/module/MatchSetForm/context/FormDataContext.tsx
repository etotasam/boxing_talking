import React, { createContext } from 'react';
import { MatchUpdateFormType, OrganizationsType } from '@/types';
import dayjs from 'dayjs';

export const initialFormData: MatchUpdateFormType = {
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
