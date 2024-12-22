import React from 'react';
import { GiBoxingGlove } from 'react-icons/gi';

export const NewVoteIcon = () => {
  return (
    <div className="flex cursor-pointer">
      <GiBoxingGlove className="w-8 h-8 rotate-[-60deg] text-red-600" />
      <span className="text-black/50 text-xs my-1 pt-1 px-2 mx-1 bg-white rounded-[50px]">
        勝敗投票
      </span>
      <GiBoxingGlove className="w-8 h-8 rotate-[170deg] text-blue-600" />
    </div>
  );
};
