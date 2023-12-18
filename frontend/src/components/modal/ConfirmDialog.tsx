import React from 'react';

type PropsType = React.ComponentProps<'div'> & AnyType;
type AnyType = {
  header: string;
};

export const ConfirmDialog = ({ children, header }: PropsType) => {
  return (
    <div className="z-20 fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center overflow-hidden">
      <div className="bg-white rounded-md py-5 px-5 min-w-[300px]">
        <h2 className="pb-7 w-full text-center">{header}</h2>
        {children}
      </div>
    </div>
  );
};
