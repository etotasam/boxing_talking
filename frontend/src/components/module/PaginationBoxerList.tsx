import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

type PropsType = {
  pageCount: number;
};

export const PaginationBoxerList = ({ pageCount }: PropsType) => {
  const { search, pathname } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const currentPage = Number(query.get('page') || 1);

  const filterParams = useMemo(() => {
    const preserveKeys = ['name', 'country'];
    const params = new URLSearchParams();
    preserveKeys.forEach((key) => {
      const value = query.get(key);
      if (value) params.set(key, value);
    });
    const str = params.toString();
    return str ? `&${str}` : '';
  }, [query]);

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      // behavior: 'smooth',
    });
  };

  return (
    Boolean(pages.length) && (
      <ul className="w-full py-3 flex justify-center sticky top-0 bg-white/80 border-b border-stone-300 z-10">
        {pages.map((page) =>
          currentPage === page ? (
            <CurrentPageNumber key={page} page={page} />
          ) : (
            <ToPageNumber
              key={page}
              onClick={scrollToTop}
              page={page}
              pathname={pathname}
              filterParams={filterParams}
            />
          )
        )}
      </ul>
    )
  );
};

const CurrentPageNumber = ({ page }: { page: number }) => {
  return <li className="px-2 bg-stone-400 text-white rounded-sm mr-2">{page}</li>;
};

type ToPageNumberType = {
  page: number;
  onClick: () => void;
  pathname: string;
  filterParams: string;
};
const ToPageNumber = (props: ToPageNumberType) => {
  const { page, onClick, pathname, filterParams } = props;
  const pageURL = `${pathname}?page=${page}${filterParams}`;
  return (
    <li className="bg-stone-700 text-white rounded-sm mr-2">
      <Link onClick={onClick} className="inline-block px-2" to={pageURL}>
        {page}
      </Link>
    </li>
  );
};
