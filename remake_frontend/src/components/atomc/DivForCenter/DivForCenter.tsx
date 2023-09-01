import React from "react";
import clsx from "clsx";

type PropsType = React.ComponentProps<"div">;

export const DivForCenter = ({ children, className }: PropsType) => {
  return (
    <div
      className={clsx(
        "h-full w-full flex justify-center items-center",
        className
      )}
    >
      {children}
    </div>
  );
};
