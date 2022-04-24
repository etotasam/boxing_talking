import React from "react";
import { CustomButton } from "@/components/atomic/Button";

type Props = {
  actionBtns: {
    btnTitle: string;
    form: string;
    // action: Function;
  }[];
};

export const EditActionBtns = ({ actionBtns }: Props) => {
  return (
    <div className="z-10 fixed top-[50px] left-0 flex items-center px-5 bg-stone-600 w-full h-[50px]">
      {actionBtns.map((el) => (
        <CustomButton key={el.btnTitle} form={el.form} className="bg-gray-300">
          {el.btnTitle}
        </CustomButton>
      ))}
    </div>
  );
};
