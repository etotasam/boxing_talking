import React from "react";
import clsx from "clsx";

type ButtonType = React.ComponentProps<"button">;

export const Button = ({ children, className, onClick }: ButtonType) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        `bg-black/80 md:hover:bg-black/60 duration-300 text-white text-sm rounded-md px-6 py-2`,
        className
      )}
    >
      {children}
    </button>
  );
};
