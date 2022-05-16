import React, { useState, useRef, useEffect } from "react";
// import { Charttest } from "@/components/module/Charttest";
export const Test = () => {
  //? chartのデータ
  const matchData = {
    labels: ["A", "B"],
    datasets: [
      {
        data: [500, 412],
        backgroundColor: [`rgb(30 64 175)`, `rgb(185 28 28)`],
        // borderColor: [
        //   mouseOnColor === MouseOn.BLUE ? `#d6d5ff` : `#717ffd`,
        //   mouseOnColor === MouseOn.RED ? `#ffe0e0` : `#ff6868`,
        // ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div>
      <div className="bg-red-500">
        {/* <Charttest matchData={matchData} setMouseOnColor={() => null} /> */}
      </div>
    </div>
  );
};
