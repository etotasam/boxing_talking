import React from "react";

type ButtonType = React.ComponentProps<"button"> & {
  data_testid?: string;
};

export const Button = React.memo(
  ({ type, onClick, children, data_testid, className }: ButtonType) => {
    return (
      <button
        type={type}
        onClick={onClick}
        data-testid={data_testid}
        className={`bg-green-600 hover:bg-green-700 duration-200 text-white rounded-sm px-4 py-1 ${className}`}
      >
        {children}
      </button>
    );
  }
);

type CustomButtonType = React.ComponentProps<"button"> & { dataTestid?: string };

export const CustomButton = React.memo(
  ({ onClick, form, children, className, dataTestid }: CustomButtonType) => {
    const baseStyle = `rounded-sm px-4 py-1`;
    const createStyle = () => {
      if (!className) return baseStyle;
      return baseStyle + ` ${className}`;
    };
    return (
      <button data-testid={dataTestid} form={form} onClick={onClick} className={createStyle()}>
        {children}
      </button>
    );
  }
);
