// ! types
import { NationalityType } from '@/assets/types';
// ! Flags
import japanFlag from '@/assets/images/flags/japan.svg';
import usaFlag from '@/assets/images/flags/usa.svg';
import philpinFlag from '@/assets/images/flags/philpin.svg';
import mexicoFlag from '@/assets/images/flags/mexico.svg';
import kazakhstanFlag from '@/assets/images/flags/kz.svg';
import ukFlag from '@/assets/images/flags/uk.svg';
import rusiaFlag from '@/assets/images/flags/rusia.svg';
import ukrineFlag from '@/assets/images/flags/ukrine.svg';
import southAfricaFlag from '@/assets/images/flags/southafrica.svg';
import chinaFlag from '@/assets/images/flags/china.svg';
import canadaFlag from '@/assets/images/flags/canada.svg';

export const Nationality = {
  Japan: "Japan",
  Mexico: "Mexico",
  USA: "USA",
  Kazakhstan: "Kazakhstan",
  UK: "UK",
  Rusia: "Rusia",
  Philpin: "Philpin",
  Ukrine: "Ukrine",
  Canada: "Canada",
  Venezuela: "Venezuela",
  Puerto_rico: "Puerto_rico",
  SouthAfrica: "SouthAfrica",
  China: "China",
} as const


export const getNatinalFlag = (country: NationalityType) => {
  if (country == Nationality.Japan) return japanFlag;
  if (country == Nationality.Philpin) return philpinFlag;
  if (country == Nationality.USA) return usaFlag;
  if (country == Nationality.Mexico) return mexicoFlag;
  if (country == Nationality.Kazakhstan) return kazakhstanFlag;
  if (country == Nationality.UK) return ukFlag;
  if (country == Nationality.Rusia) return rusiaFlag;
  if (country == Nationality.Ukrine) return ukrineFlag;
  if (country == Nationality.SouthAfrica) return southAfricaFlag;
  if (country == Nationality.China) return chinaFlag;
  if (country == Nationality.Canada) return canadaFlag;
};


export const formatPosition = (country: NationalityType) => {
  if (country == Nationality.UK) return '25% 30%';
  if (country == Nationality.Rusia) return '25% 75%';
  if (country == Nationality.SouthAfrica) return '25% 30%';
  if (country == Nationality.Mexico) return '25% 40%';
  if (country == Nationality.China) return '25% 25%';
  return 'center';
};