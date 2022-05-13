import React, { useState, useRef, useEffect } from "react";

export const Test = () => {
  const [text, setText] = useState("しょきち");
  const divRef = useRef(text);
  const test = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.target as HTMLDivElement;
    setText(el.innerText);
  };

  return (
    <div>
      <div
        className="m-10 border border-stone-800 rounded"
        contentEditable
        onInput={test}
        dangerouslySetInnerHTML={{ __html: divRef.current }}
      ></div>
      <ContentEditable value={text} />
    </div>
  );
};

const ContentEditable = ({ value }: { value: string }) => {
  const defaultValue = useRef(value);
  return (
    <div>
      <div
        className="m-10 border border-stone-800 rounded"
        contentEditable
        dangerouslySetInnerHTML={{ __html: defaultValue.current }}
      ></div>
    </div>
  );
};
