import React from "react";

type Props = React.ComponentProps<"button">;

const Button = ({ onClick, children, className }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`bg-green-400 hover:bg-green-600 duration-200 text-white rounded px-2 py-1 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
