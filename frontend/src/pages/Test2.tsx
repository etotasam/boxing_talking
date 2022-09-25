import React, { useEffect, useState } from "react";
import { Fighter } from "@/components/module/Fighter";
import { TestFighter } from "@/components/module/TestFighter";
import { TestMatchComponent } from "@/components/module/TestMatchComponent";
import { useFetchFighters } from "@/libs/hooks/useFighter";
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useGetWindowSize } from "@/libs/hooks/useGetWindowSize";
import { motion } from "framer-motion";

export const Test2 = () => {
  const { data } = useFetchFighters();
  const { data: matches } = useFetchMatches();
  const { width } = useGetWindowSize();
  return (
    <>
      {data &&
        data.map(
          (fighter, index) =>
            index === 1 && (
              <div key={fighter.id} className={` mt-3`}>
                <Fighter fighter={fighter} windowWidth={width} />
              </div>
            )
        )}

      {matches &&
        matches.map(
          (match, index) =>
            index === 1 && (
              <div key={match.id}>
                <TestMatchComponent match={match} />
              </div>
            )
        )}
      <div className="ml-5">
        <span className="cursor-pointer">test</span>
      </div>
      {/* <motion.span whileHover={} >aaaaaaaaa</motion.span> */}
    </>
  );
};
