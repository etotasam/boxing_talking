import React from "react";

type ButtonType = Omit<React.ComponentProps<"button">, "className"> & {
  data_testid?: string;
};

export const Button = React.memo(({ onClick, children, data_testid }: ButtonType) => {
  return (
    <button
      onClick={onClick}
      data-testid={data_testid}
      className={"bg-green-600 hover:bg-green-500 duration-200 text-white rounded-sm px-4 py-1"}
    >
      {children}
    </button>
  );
});

type CustomButtonType = React.ComponentProps<"button"> & { data_testid?: string };

export const CustomButton = React.memo(({ onClick, children, className, data_testid }: CustomButtonType) => {
  const baseStyle = `rounded-sm px-4 py-1`;
  const createStyle = () => {
    if (!className) return baseStyle;
    return baseStyle + ` ${className}`;
  };
  return (
    <button data-testid={data_testid} onClick={onClick} className={createStyle()}>
      {children}
    </button>
  );
});
