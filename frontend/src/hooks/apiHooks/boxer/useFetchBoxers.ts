import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import type { BoxerType, CountryType } from '@/types';

type SearchWordType = {
  name?: string | null;
  country?: CountryType | null;
};

type FetcherPropsType = {
  page: number;
  limit: number;
  searchWords: SearchWordType | undefined;
};

type ResponseType = {
  data: {
    boxers: BoxerType[];
    count: number;
  };
};

const limit = 15;

//! boxerデータ取得 and 登録済み選手の数を取得
export const useFetchBoxers = () => {
  //? params の取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramName = query.get('name');
  const paramCountry = query.get('country') as CountryType | null;
  let paramPage = Number(query.get('page'));

  if (!paramPage) {
    paramPage = 1;
  }
  let queryKey: Record<string, string | number> = { page: paramPage };

  if (paramName) {
    queryKey = { ...queryKey, name: paramName };
  }
  if (paramCountry) {
    queryKey = { ...queryKey, country: paramCountry };
  }

  const fetchBoxerAPI = async ({ page, limit, searchWords }: FetcherPropsType) => {
    const res = await Axios.get<ResponseType>(API_PATH.BOXER, {
      params: { page, limit, ...searchWords },
    }).then((result) => result.data);
    return res.data;
  };
  const {
    data: result,
    isLoading,
    isError,
    isPreviousData,
    refetch,
    isRefetching,
  } = useQuery<{
    boxers: BoxerType[];
    count: number;
  }>(
    [QUERY_KEY.BOXER, { ...queryKey }],
    () =>
      fetchBoxerAPI({
        page: paramPage,
        limit,
        searchWords: { name: paramName, country: paramCountry },
      }),
    {
      keepPreviousData: true,
      staleTime: Infinity,
      onSuccess: () => {},
      onError: () => {},
    }
  );

  let boxersData;
  let boxersCount;
  if (result) {
    boxersData = result.boxers;
    boxersCount = result.count;
  }
  const pageCount = boxersCount ? Math.ceil(boxersCount / limit) : 0;

  return {
    boxersData,
    boxersCount,
    pageCount,
    isLoading,
    isError,
    isPreviousData,
    refetch,
    isRefetching,
  };
};
