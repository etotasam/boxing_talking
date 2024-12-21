import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const customRender = (ui: React.ReactElement) => {
  return render(
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    </RecoilRoot>
  );
};

export * from '@testing-library/react';
export { customRender as render };
