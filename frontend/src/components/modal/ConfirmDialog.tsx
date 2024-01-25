import React from 'react';

type PropsType = React.ComponentProps<'div'> & AnyType;
type AnyType = {
  header: string;
  closeButton?: boolean;
  closeDialog?: () => void;
};

export const ConfirmDialog = ({
  children,
  header,
  closeButton = false,
  closeDialog,
}: PropsType) => {
  return (
    <div className="z-20 fixed top-0 left-0 w-[100vw] h-[100vh] bg-black/50 flex justify-center items-center overflow-hidden">
      <div className="bg-white rounded-md py-5 px-5 min-w-[300px] relative">
        {closeButton && (
          <span
            className="inline-block absolute top-1 right-2 text-lg cursor-pointer select-none"
            onClick={closeDialog}
          >
            ✕
          </span>
        )}
        <h2 className="pb-7 w-full text-center">{header}</h2>
        {children}
      </div>
    </div>
  );
};
