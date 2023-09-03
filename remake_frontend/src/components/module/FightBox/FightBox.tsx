import React from "react";

import japan from "@/assets/images/flags/japan.svg";
import crown from "@/assets/images/etc/champion.svg";

export const FightBox = () => {
  return (
    <>
      <section className="w-full h-full flex justify-center items-center">
        <div className="flex justify-between w-[700px]">
          <BoxerInfo />
          <BoxerInfo />
        </div>
      </section>
    </>
  );
};

const BoxerInfo = () => {
  return (
    <div className="w-[300px] h-[450px] border-[1px] border-stone-400 rounded-md flex justify-center items-center">
      {/* <div className="h-[60%] border-b-[1px] border-stone-300">データ</div> */}
      <div className="text-center w-full p-5">
        <div>
          <div className="relative flex items-center justify-center">
            <span className="absolute top-[-25px] left-[50%] translate-x-[-50%] text-sm text-gray-600">
              Naoya Inoue
            </span>
            <h2 className="relative">
              <span className="w-[32px] h-[24px] border-[1px] overflow-hidden absolute top-0 left-[-40px]">
                <img src={japan} alt="japan" />
              </span>
              井上 尚弥
            </h2>
          </div>
          {/* 戦績 */}
          <div>
            <ul className="flex justify-between w-full mt-10 text-white">
              <li className="relative flex-1 bg-red-500 before:content-['WIN'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                25
                <span className="absolute text-sm bottom-[-20px] left-[50%] text-gray-600 translate-x-[-50%] after:content-['KO']">
                  23
                </span>
              </li>
              <li className="relative flex-1 bg-gray-500 before:content-['DRWA'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                0
              </li>
              <li className="relative flex-1 bg-stone-800 before:content-['LOSE'] before:absolute before:top-[-20px] before:left-[50%] before:translate-x-[-50%] before:text-sm before:text-gray-600">
                0
              </li>
            </ul>
          </div>
          {/* ステータス */}
          <div className="mt-10">
            <ul>
              <li className="flex justify-between mt-2">
                <div className="flex-1">年齢</div>
                <div className="flex-1">30</div>
              </li>
              <li className="flex justify-between mt-2">
                <div className="flex-1">身長</div>
                <div className="flex-1 after:content-['cm']">165</div>
              </li>
              <li className="flex justify-between mt-2">
                <div className="flex-1">リーチ</div>
                <div className="flex-1 after:content-['cm']">165</div>
              </li>
              <li className="flex justify-between mt-2">
                <div className="flex-1">スタイル</div>
                <div className="flex-1">オーソドックス</div>
              </li>
            </ul>
          </div>
          {/* タイトル */}
          <div className="mt-10">
            <ul>
              <li className="mt-2">
                <p className="relative inline-block">
                  <span className="absolute top-[2px] left-[-23px] w-[18px] h-[18px] mr-2">
                    <img src={crown} alt="" />
                  </span>
                  WBO世界Sバンタム級王者
                </p>
              </li>
              <li className="mt-2">
                <p className="relative inline-block">
                  <span className="absolute top-[2px] left-[-23px] w-[18px] h-[18px] mr-2">
                    <img src={crown} alt="" />
                  </span>
                  WBC世界Sバンタム級王者
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
