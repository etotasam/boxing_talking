import clsx from 'clsx';
import React from 'react';

type PropsType = React.ComponentProps<'p'> & { content: string };
export const SubHeadline = ({ children, content }: PropsType) => {
  return (
    <div
      className={clsx(
        `relative inline-block lg:text-[15px] text-sm tracking-widest before:content-[var(--content)] before:w-full`,
        `before:tracking-normal before:font-normal before:min-w-[100px] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-[14px] before:text-stone-500`
      )}
      style={{ '--content': `"${content}"` } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
