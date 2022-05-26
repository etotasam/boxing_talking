import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export const Test2 = () => {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    startAnimate();
  }, [isActive]);

  const controls: any = useAnimation();
  const startAnimate = () => {
    if (!isActive) {
      controls.start((i: number) => i === 0 && { rotate: 45, y: 30 / 2 });
      controls.start((i: number) => i === 1 && { width: "0%" });
      controls.start((i: number) => i === 2 && { rotate: -45, y: -(30 / 2) + 3 });
    }
    if (isActive) {
      controls.start((i: number) => i === 0 && { rotate: 0, y: 0 });
      controls.start((i: number) => i === 1 && { width: "100%" });
      controls.start((i: number) => i === 2 && { rotate: 0, y: 0 });
    }
  };
  return (
    <>
      <div className="p-10">
        <div
          onClick={() => setIsActive((v) => !v)}
          className={`relative w-[35px] h-[30px] cursor-pointer`}
        >
          <motion.span
            className={`absolute top-0 left-0 inline-block w-full h-[3px] bg-gray-700`}
            custom={0}
            animate={controls}
            transition={{ duration: 0.4 }}
          ></motion.span>
          <motion.span
            className={`absolute top-[calc(50%-1.5px)] left-0 inline-block w-full h-[3px] bg-gray-700`}
            custom={1}
            animate={controls}
            transition={{ duration: 0.4 }}
          ></motion.span>
          <motion.span
            className={`absolute bottom-0 left-0 inline-block w-full h-[3px] bg-gray-700`}
            custom={2}
            animate={controls}
            transition={{ duration: 0.4 }}
          ></motion.span>
        </div>
      </div>
    </>
  );
};
