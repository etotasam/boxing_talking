import React from 'react';

type PropsType = React.ComponentProps<'p'> & { content: string };
export const SubHeadline = ({ children, content }: PropsType) => {
  return (
    <div
      className={`relative inline-block lg:text-lg text-sm before:content-[var(--content)] before:w-full before:min-w-[100px] before:absolute before:top-[-25px] before:left-[50%] before:translate-x-[-50%] before:text-[14px] before:text-stone-500`}
      style={{ '--content': `"${content}"` } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
