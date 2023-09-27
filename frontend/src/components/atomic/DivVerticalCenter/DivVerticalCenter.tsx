import React from "react";
import clsx from "clsx";

type PropsType = React.ComponentProps<"div">;

export const DivVerticalCenter = ({ children, className }: PropsType) => {
  return (
    <div className={clsx("h-full flex items-center", className)}>
      {children}
    </div>
  );
};
