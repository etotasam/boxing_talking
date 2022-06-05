import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
//! component
import { TestFighter } from "@/components/module/TestFighter";
import { useFetchFighters } from "@/libs/hooks/useFighter";
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { TestMatchComponent } from "@/components/module/TestMatchComponent";

export const Test = () => {
  const { data: fighters } = useFetchFighters();
  const { data: matches } = useFetchMatches();
  return (
    <div className="w-full min-h-[100vh] bg-stone-200">
      <div className="">
        {/* <div>{fighters && fighters.map((fighter) => <TestFighter fighter={fighter} />)}</div> */}
        {matches && matches.map((match) => <TestMatchComponent key={match.id} match={match} />)}
      </div>
    </div>
  );
};
