import { useEffect, useState } from "react";
import { Axios } from "@/libs/axios";
import { Nationality } from "@/libs/hooks/useFighter";
import { useQueryState } from "@/libs/hooks/useQueryState";
import { queryKeys } from "@/libs/queryKeys";
import { useQueryClient } from "react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";

//! custom hooks
import { useFetchFighters } from "@/libs/hooks/useFighter";
import { Button } from "@/components/atomic/Button";

type Props = React.ComponentProps<"form">;

type SubjectType = {
  name: string;
  country: string;
};

const countryDefault = "国籍を選択";
export const FighterSearchForm = ({ className }: Props) => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramName = query.get("name");
  const paramCountry = query.get("country");

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState<string>(paramName || "");
  const [country, setCountry] = useState<any>(paramCountry || "");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchSub: SubjectType = { name, country };

    const params = (Object.keys(searchSub) as Array<keyof SubjectType>).reduce((acc, key) => {
      if (searchSub[key]) {
        return acc + `&${key}=${searchSub[key]}`;
      }
      return acc;
    }, "");

    queryClient.removeQueries(queryKeys.fighter);
    queryClient.removeQueries(queryKeys.countFighter);
    navigate(`?page=1${params}`);
  };

  const reset = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setCountry("");
    setName("");
  };
  return (
    <>
      <div className={`py-5 ${className}`}>
        <h1 className="text-3xl text-center">選手検索</h1>
        <form className={`flex flex-col items-center mt-5 px-3`} onSubmit={onSubmit}>
          <div className={`w-[85%]`}>
            <input
              className={`w-full`}
              type="text"
              placeholder="選手名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select
              className="mt-5 py-1 px-2"
              name="country"
              value={country}
              onChange={(e) =>
                setCountry((old: any) => {
                  if (e.target.value === countryDefault) {
                    return;
                  } else {
                    return e.target.value;
                  }
                })
              }
              id="countrys"
            >
              <option value={undefined}>{countryDefault}</option>
              {Object.values(Nationality).map((nationalName) => (
                <option key={nationalName} value={nationalName}>
                  {nationalName}
                </option>
              ))}
            </select>

            <Button type="button" onClick={reset} className={`float-right mt-5`}>
              リセット
            </Button>

            <Button className={`mt-5 w-full`}>検索</Button>
          </div>
        </form>
      </div>
    </>
  );
};
