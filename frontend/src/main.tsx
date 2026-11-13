import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RecoilRoot } from 'recoil';
import { createQueryClient } from './queryClient';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;
const siteDescription = import.meta.env.VITE_APP_SITE_DESCRIPTION;

const queryClient = createQueryClient();
ReactDOM.createRoot(document.getElementById('root')!).render(
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
);
