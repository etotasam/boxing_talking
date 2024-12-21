import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './index.css';
// ! TanStack Query
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
// ! Recoil
import { RecoilRoot } from 'recoil';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;
const siteDescription = import.meta.env.VITE_APP_SITE_DESCRIPTION;

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
          <meta name="description" content={siteDescription} />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content={siteTitle} />
          <meta property="og:description" content={siteDescription}></meta>
        </Helmet>
        <App />
      </HelmetProvider>
    </RecoilRoot>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  // </React.StrictMode>
);
