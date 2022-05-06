import { useState } from "react";
import { Doughnut, Pie, Bar, getElementAtEvent } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import { PolarArea } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Context } from "chartjs-plugin-datalabels";
import { Link } from "react-router-dom";
import { Axios } from "@/libs/axios";

import useSWR from "swr";
import { useEffect } from "react";
import { LoadingModal } from "@/components/modal/LoadingModal";

//! custom hooks
import { useQueryState } from "@/libs/hooks/useQueryState";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const datalabels: any = {
  formatter: (value: any, ctx: Context) => {
    const dataArray = ctx.dataset.data
      .map((el) => {
        if (typeof el !== "number") return null;
        return el;
      })
      .filter((el) => el !== null) as number[];
    const total = dataArray.reduce((acc, curr) => {
      return acc + curr;
    });
    return `${Math.round((value / total) * 100)}%`;
  },
  color: "#262525",
  align: "end",
  offset: 15,
  font: {
    size: 16,
  },
};
const options = {
  cutout: "75%",
  layout: {
    padding: 30,
  },
  plugins: {
    datalabels: datalabels,
    legend: {
      display: false,
      onClick: () => false,
      reverse: true,
    },
    tooltip: {
      enabled: false,
    },
  },
};

export const Test = () => {
  const [testData, setTestData] = useQueryState<string>("q_test", "testの初期値");
  const [nameData, setNameData] = useQueryState<string>("q_name", "test");
  const fetcher = async () => await Axios.get("/api/test").then((value) => value.data);
  const { data: fetchData, error, mutate } = useSWR("/api/test", fetcher);
  const data1 = {
    labels: ["red", "blue"],
    datasets: [
      {
        data: [20, 10],
        backgroundColor: [`#6c6c6c`, `#acacac`],
        hoverBackgroundColor: [`#ff8585`, `#8793ff`],
        borderWidth: 0,
      },
    ],
  };

  const [pending, setPending] = useState(false);
  const testFunc = async () => {
    setPending(true);
    await mutate(fetchData);
    console.log("test");
    setPending(false);
  };

  useEffect(() => {
    console.log(nameData);
  }, [nameData]);

  if (error) return <div>error</div>;

  return (
    <>
      <h1>{testData}</h1>
      <button onClick={() => setTestData("テスト更新")} className={`bg-red-500`}>
        ぼたん
      </button>
      <Link to={`/check`}>check</Link>
      <div className={`flex`}>
        <div className="relative w-[300px] h-[300px]">
          <h1 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-stone-600 select-none">
            みんなの勝敗予想
          </h1>
          <Doughnut data={data1} options={options} plugins={[ChartDataLabels]} />
        </div>
      </div>
      <button onClick={testFunc}>refetch</button>
      <div className="bg-red-50">
        <form onSubmit={() => null}>
          <input
            className="mt-3 px-1 bourder rounded border-black"
            type="text"
            placeholder="選手名"
            name="name"
            value={nameData}
            onChange={(e) => setNameData(e.target.value)}
          />
        </form>
      </div>
      {(!fetchData || pending) && <LoadingModal />}
    </>
  );
};
