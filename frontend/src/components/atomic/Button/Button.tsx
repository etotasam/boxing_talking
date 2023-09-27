import React from 'react';
import clsx from 'clsx';

type ButtonType = React.ComponentProps<'button'> & { bgColor?: string };

export const Button = ({
  children,
  className,
  onClick,
  bgColor,
}: ButtonType) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        `duration-300 text-white text-sm rounded-md px-6 py-2`,
        bgColor ? bgColor : 'bg-black/80 md:hover:bg-black/60',
        className
      )}
    >
      {children}
    </button>
  );
};
