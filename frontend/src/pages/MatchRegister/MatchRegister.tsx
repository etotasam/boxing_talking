import axios, { isAxiosError } from "@/libs/axios";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/atomic/Button";
import { FighterType } from "@/libs/types/fighter";
import dayjs from "dayjs";

// layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

// hooks
import { useFetchFighters } from "@/libs/hooks/useFetchFighters";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";

//component
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
      const { data } = await axios.post("api/match/register", {
        redFighterId: redFighter?.id,
        blueFighterId: blueFighter?.id,
        matchDate: matchDate,
      });
      await fetchAllMatches();
      setSelectFightersId({ red: null, blue: null });
      setMatchDate("");
      console.log(data);
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
        register={register}
      />
      <div className="flex mt-[150px]">
        <div className="w-2/3">
          <h1>選手一覧</h1>
          <div className="mt-5">
            {fightersState.fighters &&
              fightersState.fighters.map((fighter) => (
                <div key={fighter.id} className="relative mt-3 first:mt-0">
                  <input
                    type="checkbox"
                    id={`fighter_${fighter.id}`}
                    value={fighter.id}
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
          <div className="sticky top-[200px]">
            <label htmlFor="match-date">試合日</label>
            <input
              id="match-date"
              type="date"
              value={matchDate}
              min={dayjs().format("YYYY-MM-DD")}
              onChange={(e) => setMatchDate(e.target.value)}
            />
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
  register: () => void;
};

const SelectFighters = ({ redFighter, blueFighter, selectFightersId, register }: SelectFightersProps) => {
  const [fillSelectFighter, setFIllSelectFighter] = useState(false);
  useEffect(() => {
    const result = !Object.values(selectFightersId).some((value) => value === null);
    setFIllSelectFighter(result);
  }, [selectFightersId]);
  return (
    <div className="z-10 w-full fixed top-[50px] left-0 bg-stone-600">
      <div className="flex w-full h-[150px] p-3">
        {redFighter ? <Fighter className="w-1/2" cornerColor="red" fighter={redFighter} /> : <div className="w-1/2" />}
        {blueFighter && <Fighter className="w-1/2" fighter={blueFighter} />}
      </div>
      {fillSelectFighter && (
        <button
          onClick={register}
          className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-stone-600 text-white px-3 py-1"
        >
          登録
        </button>
      )}
    </div>
  );
};

// const RightObject = () => {
//   const handleInputDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     console.log(e.target.value);
//   };
//   return (
//     <div className="sticky top-[200px]">
//       <label htmlFor="match-date">試合日</label>
//       <input id="match-date" type="date" min={dayjs().format("YYYY-MM-DD")} onChange={handleInputDateChange} />
//     </div>
//   );
// };
