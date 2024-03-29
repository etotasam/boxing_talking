import { Helmet } from 'react-helmet-async';
const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>ページが見つかりません | {siteTitle}</title>
      </Helmet>
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-center">
        <p className="text-[34px] text-stone-400 font-bold select-none mb-5">
          404 Not Found
        </p>
      </div>
    </>
  );
};
