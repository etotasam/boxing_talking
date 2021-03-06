import React from "react";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Pie, getElementAtEvent } from "react-chartjs-2";
import { MouseOn } from "@/components/module/MatchInfo";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Context } from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend);
// ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

type Props = {
  matchData: any;
  setMouseOnColor: (color: MouseOn) => void;
  className?: string;
};

export function TestChart({ matchData, setMouseOnColor, className }: Props) {
  const chartRef = React.useRef<any>(null);
  // callback of when mouse move on Graph
  const click = (event: any): void => {
    if (chartRef !== null) {
      const el = getElementAtEvent(chartRef.current, event);
      if (el.length !== 0) {
        const mouseOnColor = el[0].index === 0 ? MouseOn.BLUE : MouseOn.RED;
        setMouseOnColor(mouseOnColor);
      } else {
        setMouseOnColor(MouseOn.NULL);
      }
    }
  };

  const datalabels: any = {
    formatter: (value: any, ctx: Context) => {
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
      return `${Math.round((value / total) * 100)}%`;
    },
    color: "#414141",
    align: "end",
    offset: 25,
    font: {
      size: 16,
    },
  };

  // callback of when clicked Labels
  const options = {
    cutout: "78%",
    layout: {
      padding: 30,
    },
    plugins: {
      legend: {
        display: false,
        onClick: () => false,
        reverse: true,
      },
      datalabels: datalabels,
      tooltip: {
        enabled: false,
      },
    },
  };
  return (
    // <Doughnut
    //   ref={chartRef}
    //   data={matchData}
    //   onClick={click}
    //   options={options}
    // />
    <div className={`relative flex justify-center items-center ${className}`}>
      <div className="max-w-[500px] min-w-[400px] p-10">
        <h1 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-stone-600 text-xl select-none">
          ????????????????????????
        </h1>
        <Doughnut
          ref={chartRef}
          data={matchData}
          plugins={[ChartDataLabels]}
          options={options}
          // onMouseLeave={() => setMouseOnColor(MouseOn.NULL)}
          onMouseMove={click}
          onClick={click}
        />
      </div>
    </div>
  );
}
