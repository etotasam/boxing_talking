import React from "react";

type Props = React.ComponentProps<"button"> & {
  data_testid?: string;
};

const Button = React.memo(
  ({ onClick, children, className, data_testid }: Props) => {
    const classname = className || "";
    return (
      <button
        onClick={onClick}
        data-testid={data_testid}
        className={`bg-green-400 hover:bg-green-600 duration-200 text-white rounded px-2 py-1 ${classname}`}
      >
        {children}
      </button>
    );
  }
);

export default Button;
