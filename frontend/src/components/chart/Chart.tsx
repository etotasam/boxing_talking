import React from "react";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Pie, getElementAtEvent } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);
// ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

type Props = {
  matchData: any;
};

export function TestChart({ matchData }: Props) {
  const chartRef = React.useRef<any>(null);
  // callback of when clicked Graph
  const click = (event: any): void => {
    if (chartRef !== null) {
      const el = getElementAtEvent(chartRef.current, event);
      if (el.length !== 0) {
        const element = el[0].index === 0 ? "赤" : "青";
        console.log(element);
        return;
      }
    }
  };
  // callback of when clicked Labels
  const options = {
    plugins: {
      legend: {
        onClick: () => false,
        reverse: true,
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
    <Pie ref={chartRef} data={matchData} onClick={click} options={options} />
  );
}
