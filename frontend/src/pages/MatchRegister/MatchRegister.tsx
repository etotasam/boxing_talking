import axios, { isAxiosError } from "@/libs/axios";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/atomic/Button";
import { FighterType } from "@/libs/types/fighter";
import dayjs from "dayjs";

// layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

// api
import { registerMatchAPI } from "@/libs/apis/matchAPI";

// hooks
import { useFetchFighters } from "@/libs/hooks/useFetchFighters";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";

//component
import { Button } from "@/components/atomic/Button";
import { Fighter } from "@/components/module/Fighter";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";

export const MatchRegister = () => {
  const { fetchAllFighters, fightersState, cancel: fetchFighterCancel } = useFetchFighters();
  useEffect(() => {
    if (fightersState.fighters !== undefined) return;
    fetchAllFighters();
    return () => {
      fetchFighterCancel();
    };
  }, []);

  const typeIs = <T,>(el: T | undefined): el is T => {
    return typeof el !== "undefined";
  };

  type MatchSlectFightersType = {
    red: string | null;
    blue: string | null;
  };

  const clearChecked = () => {
    setSelectFightersId({ red: null, blue: null });
  };
  const isChecked = (id: number) => {
    return Object.values(selectFightersId).some((value) => value === String(id));
  };
  const [selectFightersId, setSelectFightersId] = useState<MatchSlectFightersType>({ red: null, blue: null });
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (selectFightersId.red === null) {
        setSelectFightersId({ ...selectFightersId, red: e.target.value });
        return;
      }
      if (selectFightersId.blue === null) {
        setSelectFightersId({ ...selectFightersId, blue: e.target.value });
        return;
      }
      return;
    }
    const sub = Object.keys(selectFightersId).reduce((acc, key) => {
      // @ts-ignore
      if (selectFightersId[key] === e.target.value) {
        return { ...acc, [key]: null };
      }
      return { ...acc };
    }, selectFightersId);
    // @ts-ignore
    setSelectFightersId(sub);
  };

  const canCheck = (id: number) => {
    if (Object.values(selectFightersId).some((el) => el === null)) return false;
    if (Object.values(selectFightersId).some((el) => Number(el) === id)) return false;
    return true;
  };

  const [redFighter, setRedFighter] = useState<FighterType>();
  const [blueFighter, setBlueFighter] = useState<FighterType>();
  useEffect(() => {
    if (fightersState.fighters === undefined) return;
    const red = fightersState.fighters.find((el) => el.id === Number(selectFightersId.red));
    setRedFighter(red);
    const blue = fightersState.fighters.find((el) => el.id === Number(selectFightersId.blue));
    setBlueFighter(blue);
  }, [selectFightersId]);

  const { fetchAllMatches } = useFetchAllMatches();
  const [postMatchPending, setPostMatchPending] = useState(false);
  const [matchDate, setMatchDate] = useState<string>("");
  const register = async (): Promise<void> => {
    if (!redFighter || !blueFighter || !matchDate) return;
    try {
      setPostMatchPending(true);
      const registerResponse = await registerMatchAPI({
        red_fighter_id: redFighter?.id,
        blue_fighter_id: blueFighter?.id,
        match_date: matchDate,
      });
      await fetchAllMatches();
      clearChecked();
      setMatchDate("");
      console.log(registerResponse);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
      }
    }
    setPostMatchPending(false);
  };

  return (
    <LayoutForEditPage>
      <SelectFighters
        redFighter={redFighter}
        blueFighter={blueFighter}
        selectFightersId={selectFightersId}
        matchDate={matchDate}
        submit={register}
      />
      <div className="flex mt-[150px]">
        <div className="w-2/3">
          <h1 onClick={clearChecked}>選手一覧</h1>
          <div className="mt-5">
            {fightersState.fighters &&
              fightersState.fighters.map((fighter) => (
                <div key={fighter.id} className="relative mt-3 first:mt-0">
                  <input
                    type="checkbox"
                    id={`fighter_${fighter.id}`}
                    value={fighter.id}
                    checked={isChecked(fighter.id)}
                    disabled={canCheck(fighter.id)}
                    onChange={handleCheckboxChange}
                    className={`absolute top-[50%] left-3 translate-y-[-50%]`}
                  />
                  <label htmlFor={`fighter_${fighter.id}`}>
                    <Fighter fighter={fighter} />
                  </label>
                </div>
              ))}
          </div>
        </div>
        <div className="w-1/3 bg-red-200">
          <div className="flex flex-col sticky top-[200px]">
            <div>
              <label htmlFor="match-date">試合日</label>
              <input
                id="match-date"
                type="date"
                value={matchDate}
                min={dayjs().format("YYYY-MM-DD")}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </div>
            <div>
              <Button onClick={clearChecked}>選択選手クリア</Button>
            </div>
          </div>
        </div>
      </div>
      {postMatchPending && <FullScreenSpinnerModal />}
    </LayoutForEditPage>
  );
};

type SelectFightersProps = {
  redFighter: FighterType | undefined;
  blueFighter: FighterType | undefined;
  selectFightersId: Record<"red" | "blue", string | null>;
  matchDate: string;
  submit: () => void;
};

const SelectFighters = ({ redFighter, blueFighter, selectFightersId, matchDate, submit }: SelectFightersProps) => {
  const [isSelectFighters, setIsSelectFighters] = useState(false);
  useEffect(() => {
    const result = !Object.values(selectFightersId).some((value) => value === null);
    setIsSelectFighters(result);
  }, [selectFightersId]);
  return (
    <div className="z-10 w-full fixed top-[50px] left-0 bg-stone-600">
      <div className="flex w-full h-[150px] p-3">
        {redFighter ? <Fighter className="w-1/2" cornerColor="red" fighter={redFighter} /> : <div className="w-1/2" />}
        {blueFighter && <Fighter className="w-1/2" fighter={blueFighter} />}
      </div>
      {isSelectFighters && matchDate && (
        <button
          onClick={submit}
          className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-stone-600 text-white px-3 py-1"
        >
          登録
        </button>
      )}
      {isSelectFighters && (
        <div className="absolute top-[75%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-stone-600 text-white px-3 py-1">
          {matchDate ? dayjs(matchDate).format("YYYY/M/D") : "試合日が未設定です"}
        </div>
      )}
    </div>
  );
};
