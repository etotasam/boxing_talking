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

  return (
    <>
      {pagesArray().length > 1 && (
        <ul className="w-full py-3 flex justify-center sticky top-[80px] right-[100px] bg-white/80 border-b-[1px] border-stone-300 z-10">
          {pages.map((page) =>
            paramPage === page ? (
              <li
                key={page}
                className="px-2 bg-stone-400 text-white rounded-sm mr-2"
              >
                {page}
              </li>
            ) : (
              <li
                key={page}
                className="bg-stone-700 text-white rounded-sm mr-2"
              >
                <Link
                  className="inline-block px-2"
                  to={`${pathname}?page=${page}${formattedParams}`}
                >
                  {page}
                </Link>
              </li>
            )
          )}
        </ul>
      )}
    </>
  );
};
