import { useQueryClient } from '@tanstack/react-query';

export const useReactQuery = () => {
  const queryClient = useQueryClient();

  const getReactQueryData = <T>(queryKey: string): T => {
    const res = queryClient.getQueryData([queryKey]) as T;
    return res;
  };

  const setReactQueryData = <T>(queryKey: string, newData: T): void => {
    queryClient.setQueriesData({ queryKey: [queryKey] }, newData);
  };

  const refetchReactQueryData = (queryKey: string): void => {
    queryClient.refetchQueries({ queryKey: [queryKey] });
  };

  const refetchReactQueryArrayKeys = (queryKeys: string[]) => {
    queryKeys.forEach((key) => {
      queryClient.refetchQueries({ queryKey: [key] });
    });
  };

  return {
    getReactQueryData,
    setReactQueryData,
    refetchReactQueryData,
    refetchReactQueryArrayKeys,
  };
};
