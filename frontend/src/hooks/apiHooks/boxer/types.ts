import type { AxiosResponse } from 'axios';
import type { BoxerType } from '@/types';

export type UpdateBoxerDataType = Pick<BoxerType, 'id'> & Partial<BoxerType>;
export type RegisterBoxerDataType = Omit<BoxerType, 'id'>;

type BoxerApiDefaultErrorDataType = {
  errorCode?: number | false;
  message?: string;
};

type BoxerApiErrorDataType = BoxerApiDefaultErrorDataType;

export type BoxerApiErrorResponseType = AxiosResponse<BoxerApiErrorDataType>;
