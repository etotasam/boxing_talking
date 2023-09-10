import React from "react";
import clsx from "clsx";

type PropsType = React.ComponentProps<"div">;

export const ClearFullScreenDiv = ({
  children,
  className,
  onClick,
}: PropsType) => {
  return (
    <div
      onClick={onClick}
      className={clsx("fixed top-0 left-0 w-screen h-screen", className)}
    >
      {children}
    </div>
  );
};
