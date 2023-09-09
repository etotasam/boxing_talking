import React from "react";
import clsx from "clsx";
// ! types
import { NationalityType } from "@/assets/types";
// ! Nationaly
import { Nationality } from "@/assets/NationalFlagData";
// ! Flags
import japanFlag from "@/assets/images/flags/japan.svg";
import usaFlag from "@/assets/images/flags/usa.svg";
import philpinFlag from "@/assets/images/flags/philpin.svg";
import mexicoFlag from "@/assets/images/flags/mexico.svg";
import kazakhstanFlag from "@/assets/images/flags/kz.svg";
import ukFlag from "@/assets/images/flags/uk.svg";
import rusiaFlag from "@/assets/images/flags/rusia.svg";
import ukrineFlag from "@/assets/images/flags/ukrine.svg";

type PropsType = React.ComponentProps<"div"> & { nationaly: NationalityType };

export const FlagImage = ({ nationaly, className }: PropsType) => {
  const getNatinalFlag = (country: NationalityType) => {
    if (country == Nationality.Japan) return japanFlag;
    if (country == Nationality.Philpin) return philpinFlag;
    if (country == Nationality.USA) return usaFlag;
    if (country == Nationality.Mexico) return mexicoFlag;
    if (country == Nationality.Kazakhstan) return kazakhstanFlag;
    if (country == Nationality.UK) return ukFlag;
    if (country == Nationality.Rusia) return rusiaFlag;
    if (country == Nationality.Ukrine) return ukrineFlag;
  };

  return (
    <>
      <div className={clsx(className)}>
        <img
          className="w-full h-full object-cover"
          src={getNatinalFlag(nationaly)}
          alt={nationaly}
        />
      </div>
    </>
  );
};
