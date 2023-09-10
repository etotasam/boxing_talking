import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type PropsType = {
  pageCount: number;
};

export const PaginationBoxerList = ({ pageCount }: PropsType) => {
  const { search, pathname } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get("page") || 1);
  const paramName = query.get("name");
  const paramCountry = query.get("country");
  const [formattedParames, setFormattedParames] = useState("");
  useEffect(() => {
    let pageURL: string[] = [];
    if (paramName) pageURL = [...pageURL, `name=${paramName}`];
    if (paramCountry) pageURL = [...pageURL, `country=${paramCountry}`];
    setFormattedParames(pageURL.length ? `&${pageURL.join("&")}` : "");
  }, [search]);

  const pagesArray = (): number[] => {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  };

  return (
    <>
      {pagesArray().length > 1 && (
        <ul className="w-full py-3 flex justify-center sticky top-[105px] right-[100px] bg-white/80 border-b-[1px] border-stone-300 z-10">
          {pagesArray().map((page) =>
            paramPage === page ? (
              <li
                key={page}
                className="px-2 bg-stone-400 text-white rounded-sm mr-2"
              >
                {page}
              </li>
            ) : (
              <Link
                key={page}
                to={`${pathname}?page=${page}${formattedParames}`}
              >
                <li className="px-2 bg-stone-700 text-white rounded-sm mr-2">
                  {page}
                </li>
              </Link>
            )
          )}
        </ul>
      )}
    </>
  );
};
