import React from "react";

type Props = {
  borderColor: string;
  borderWidth: string;
  data_testid: string;
  className: string;
};

const defaultStyle = {
  borderColor: "border-gray-400",
  borderWidth: "border-t-[1px]",
};

const Border = React.memo(
  ({
    data_testid,
    borderColor = defaultStyle.borderColor,
    borderWidth = defaultStyle.borderWidth,
    className,
  }: Partial<Props>) => {
    return (
      <div
        data-testid={data_testid}
        className={`${borderColor} ${borderWidth} ${className}`}
      />
    );
  }
);

export default Border;
