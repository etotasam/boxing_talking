import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './index.css';
// ! TanStac Query
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
// ! Recoil
import { RecoilRoot } from 'recoil';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <RecoilRoot>
      <HelmetProvider>
        <Helmet>
          <title>{siteTitle}</title>
        </Helmet>
        <App />
      </HelmetProvider>
    </RecoilRoot>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  // </React.StrictMode>
);
