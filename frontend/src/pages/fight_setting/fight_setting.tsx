import axios, { isAxiosError } from "../../libs/axios";
import { useEffect, useState } from "react";
import Button from "../../components/Button";

type Fighter = {
  id: number;
  name: string;
  country: string;
  win: number;
  draw: number;
  lose: number;
  ko: number;
};

export const FightSetting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fighters, setFighters] = useState<Fighter[]>();
  const [redFighter, setRedFighter] = useState<Fighter | null>(null);
  const [blueFighter, setBlueFighter] = useState<Fighter | null>(null);
  const getFighter = async (): Promise<Fighter[] | undefined> => {
    if (fighters) return;
    try {
      const { data } = await axios.post("api/fighter");
      return data;
      // setFighters(data);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
      }
    }
  };
  const choiceFighter = (fighter: Fighter): void => {
    if (!redFighter && !blueFighter) {
      setRedFighter(fighter);
    }
    if (redFighter && !blueFighter) {
      if (redFighter.id === fighter.id) return;
      setBlueFighter(fighter);
    }
  };
  const clearFighters = (): void => {
    setRedFighter(null);
    setBlueFighter(null);
  };

  const registerFight = async (): Promise<void> => {
    setIsLoading(true);
    const redFighterId = redFighter!.id;
    const blueFighterId = blueFighter!.id;
    const matchDate = `${choiseYear}-${choiseMonth}-${choiseDate}`;
    console.log("送信", matchDate);
    try {
      const { data } = await axios.post("api/fight", {
        redFighterId,
        blueFighterId,
        matchDate,
      });
      console.log("返り", data);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
      }
    }
    setIsLoading(false);
  };

  type MatchState = {
    red: Fighter;
    blue: Fighter;
    date: Date;
  };
  const [allMatch, setAllMatch] = useState<MatchState[] | undefined>();
  const getAllMatch = async (): Promise<MatchState[] | undefined> => {
    try {
      const { data } = await axios.get("api/match");
      return data;
      // setAllMatch(data);
      // console.log(data);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response);
      }
    }
  };

  const typeIs = <T,>(el: T | undefined): el is T => {
    return typeof el !== "undefined";
  };

  useEffect(() => {
    (async () => {
      const fighter = await getFighter();
      const match = await getAllMatch();
      if (typeIs<Fighter[]>(fighter)) {
        setFighters(fighter);
      }
      if (typeIs<MatchState[]>(match)) {
        setAllMatch(match);
      }
    })();
  }, []);

  const date = new Date();
  const thisYear = date.getFullYear();
  const thisMonth = date.getMonth() + 1;
  const thisDate = date.getDate();
  const [choiseYear, setChoiseYear] = useState<number>(thisYear);
  const [choiseMonth, setChoiseMonth] = useState<number>(thisMonth);
  const [choiseDate, setChoiseDate] = useState<number>(thisDate);
  const days = new Date(choiseYear, choiseMonth, 0).getDate();

  if (isLoading) return <h1>getting Match...</h1>;
  return (
    <>
      <h1>Fight</h1>
      <div className="flex w-full">
        {fighter(redFighter, "bg-red-400 w-1/2")}
        {fighter(blueFighter, "bg-blue-400 w-1/2")}
      </div>
      <Button className="bg-blue-500 hover:bg-blue-400" onClick={clearFighters}>
        クリア
      </Button>
      <Button
        className={`${
          !blueFighter
            ? `bg-gray-300 pointer-events-none`
            : `bg-red-500 hover:bg-red-400`
        }`}
        onClick={registerFight}
      >
        DBに登録
      </Button>
      <Button onClick={getAllMatch}>リーレーションチェック</Button>
      <select
        onChange={(e) => setChoiseYear(Number(e.target.value))}
        name=""
        id=""
        className="bg-green-500"
      >
        <option value={thisYear}>{thisYear}</option>
        <option value={thisYear + 1}>{thisYear + 1}</option>
      </select>
      <select
        defaultValue={thisMonth}
        onChange={(e) => setChoiseMonth(Number(e.target.value))}
        name=""
        id=""
        className="bg-green-500"
      >
        {[...Array(12)].map((_, month) => (
          <option key={month} value={month + 1}>
            {month + 1}
          </option>
        ))}
      </select>
      <select
        defaultValue={thisDate}
        onChange={(e) => setChoiseDate(Number(e.target.value))}
        name=""
        id=""
        className="bg-green-500"
      >
        {[...Array(days)].map((_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>

      <h1>選手一覧</h1>
      <ul className="mt-5">
        {fighters &&
          fighters.map((fighter) => (
            <li
              onClick={() => choiceFighter(fighter)}
              key={fighter.id}
              className={`cursor-pointer ${
                redFighter && fighter.id === redFighter.id
                  ? "bg-red-400"
                  : blueFighter && fighter.id === blueFighter.id
                  ? "bg-blue-400"
                  : "odd:bg-red-100 even:bg-blue-100"
              }`}
            >
              <p>{fighter.name}</p>
              <p>{fighter.country}</p>
              <p>{`${fighter.win}勝 ${fighter.draw}分 ${fighter.lose}敗 ${fighter.ko}KO`}</p>
            </li>
          ))}
      </ul>
      <h1>試合一覧</h1>
      <div>
        {allMatch?.map((matchArray, index) => (
          <div key={index} className="flex w-full mt-3">
            <h1>{matchArray.date}</h1>
            <div className="w-1/2 bg-red-400">
              <p>{matchArray.red.name}</p>
              <p>{`${matchArray.red.win}勝 ${matchArray.red.draw}分 ${matchArray.red.lose}敗 ${matchArray.red.ko}KO`}</p>
            </div>
            <div className="w-1/2 bg-blue-400">
              <p>{matchArray.blue.name}</p>
              <p>{`${matchArray.blue.win}勝 ${matchArray.blue.draw}分 ${matchArray.blue.lose}敗 ${matchArray.blue.ko}KO`}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const fighter = (fighter: Fighter | null, className: string) => {
  return (
    <div className={className}>
      {fighter && (
        <>
          <p>{fighter.name}</p>
          <p>{fighter.country}</p>
          <p>{`${fighter.win}勝 ${fighter.draw}分 ${fighter.lose}敗 ${fighter.ko}KO`}</p>
        </>
      )}
    </div>
  );
};
