import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type PropsType = {
  pageCount: number;
};

export const PaginationBoxerList = ({ pageCount }: PropsType) => {
  const { search, pathname } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get('page') || 1);
  const paramName = query.get('name');
  const paramCountry = query.get('country');
  const [formattedParams, setFormattedParams] = useState('');
  useEffect(() => {
    let pageURL: string[] = [];
    if (paramName) pageURL = [...pageURL, `name=${paramName}`];
    if (paramCountry) pageURL = [...pageURL, `country=${paramCountry}`];
    setFormattedParams(pageURL.length ? `&${pageURL.join('&')}` : '');
  }, [search]);

  const pagesArray = (): number[] => {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  };

  const pages = pagesArray();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      // behavior: 'smooth',
    });
  };

  return (
    <>
      {Boolean(pages.length) && (
        <ul className="w-full py-3 flex justify-center sticky top-[80px] right-[100px] bg-white/80 border-b-[1px] border-stone-300 z-10">
          {pages.map((page) =>
            paramPage === page ? (
              <CurrentPageNumber key={page} page={page} />
            ) : (
              <ToPageNumber
                key={page}
                onClick={scrollToTop}
                page={page}
                pathname={pathname}
                formattedParams={formattedParams}
              />
            )
          )}
        </ul>
      )}
    </>
  );
};

const CurrentPageNumber = ({ page }: { page: number }) => {
  return (
    <li className="px-2 bg-stone-400 text-white rounded-sm mr-2">{page}</li>
  );
};

type ToPageNumberType = {
  page: number;
  onClick: () => void;
  pathname: string;
  formattedParams: string;
};
const ToPageNumber = (props: ToPageNumberType) => {
  const { page, onClick, pathname, formattedParams } = props;
  return (
    <li className="bg-stone-700 text-white rounded-sm mr-2">
      <Link
        onClick={onClick}
        className="inline-block px-2"
        to={`${pathname}?page=${page}${formattedParams}`}
      >
        {page}
      </Link>
    </li>
  );
};
