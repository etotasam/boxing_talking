import React from "react";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Pie, getElementAtEvent } from "react-chartjs-2";
import { MouseOn } from "@/components/module/MatchInfo";

// type
import { FighterType } from "@/libs/types/fighter";

ChartJS.register(ArcElement, Tooltip, Legend);
// ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

type Props = {
  fighterData: FighterType | undefined;
  setMouseOnColor: (color: MouseOn) => void;
};

export function FighterChart({ fighterData, setMouseOnColor }: Props) {
  const chartRef = React.useRef<any>(null);

  const matchData = {
    labels: [
      `WIN:${fighterData?.win}`,
      `KO:${fighterData?.ko}`,
      `DRAW:${fighterData?.draw}`,
      `LOSE:${fighterData?.lose}`,
    ],
    datasets: [
      {
        data: [fighterData?.win, fighterData?.ko, fighterData?.draw, fighterData?.lose],
        backgroundColor: [
          `rgb(34 197 94)`,
          `rgb(30 140 94)`,
          `rgb(168 162 158)`,
          `rgb(41 37 36)`,
          // mouseOnColor === MouseOn.BLUE ? `rgb(96 165 250)` : `rgb(191 219 254)`,
          // mouseOnColor === MouseOn.RED ? `rgb(248 113 113)` : `rgb(254 202 202)`,
        ],
        // borderColor: [
        //   mouseOnColor === MouseOn.BLUE ? `#d6d5ff` : `#717ffd`,
        //   mouseOnColor === MouseOn.RED ? `#ffe0e0` : `#ff6868`,
        // ],
        borderWidth: 1,
      },
    ],
  };

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
  // callback of when clicked Labels
  const options = {
    plugins: {
      legend: {
        onClick: () => false,
        reverse: false,
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
    <Doughnut
      ref={chartRef}
      data={matchData}
      // onMouseLeave={() => setMouseOnColor(MouseOn.NULL)}
      onMouseMove={click}
      onClick={click}
      options={options}
    />
  );
}
