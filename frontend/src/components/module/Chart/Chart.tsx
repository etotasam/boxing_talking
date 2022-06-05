import React from "react";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Pie, getElementAtEvent } from "react-chartjs-2";
import { MouseOn } from "@/components/module/MatchInfo";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Context } from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  matchData: any;
  setMouseOnColor: (color: MouseOn) => void;
  className?: string;
};

export function Chart({ matchData, setMouseOnColor, className }: Props) {
  const chartRef = React.useRef<any>(null);
  // callback of when mouse move on Graph
  const mouseMove = (event: any): void => {
    if (!chartRef.current) return;
    const el = getElementAtEvent(chartRef.current, event);
    if (el.length !== 0) {
      const mouseOnColor = el[0].index === 0 ? MouseOn.BLUE : MouseOn.RED;
      setMouseOnColor(mouseOnColor);
    } else {
      setMouseOnColor(MouseOn.NULL);
    }
  };

  const datalabels = {
    formatter: (value: any, ctx: Context) => {
      if (value === undefined) return;
      const dataArray = ctx.dataset.data
        .map((el) => {
          if (typeof el !== "number") return null;
          return el;
        })
        .filter((el) => el !== null) as number[];
      if (!dataArray.length) return;
      const total = dataArray.reduce((acc, curr) => {
        return acc + curr;
      });
      if (total === 0) return "0%";
      const fighterName = (ctx.dataset as any).labels[ctx.dataIndex];
      return ` ${value}票 \n ${Math.round((value / total) * 100)}%`;
    },
    color: "#4e4e4e",
    align: "end",
    offset: 20,
    font: {
      size: 16,
      weight: 500,
    },
  };

  // callback of when clicked Labels
  const options = {
    cutout: "78%",
    layout: {
      padding: 50,
    },
    plugins: {
      legend: {
        display: false,
        onClick: () => false,
        reverse: true,
      },
      datalabels: datalabels as any,
      tooltip: {
        enabled: false,
      },
    },
  };
  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      {/* <div className="mx-auto max-w-min p-10"> */}
      <h1 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-stone-600 text-xl select-none">
        みんなの試合予想
      </h1>
      <div className="w-[350px] h-[350px]">
        <Doughnut
          ref={chartRef}
          width={500}
          height={500}
          data={matchData}
          plugins={[ChartDataLabels]}
          options={options}
          onMouseMove={mouseMove}
        />
      </div>
    </div>
  );
}
