// ! types
import { NationalityType } from '@/assets/types';
// ! Flags
import japanFlag from '@/assets/images/flags/japan.svg';
import usaFlag from '@/assets/images/flags/usa.svg';
import philippinesFlag from '@/assets/images/flags/philippines.svg';
import mexicoFlag from '@/assets/images/flags/mexico.svg';
import kazakhstanFlag from '@/assets/images/flags/kz.svg';
import ukFlag from '@/assets/images/flags/uk.svg';
import russiaFlag from '@/assets/images/flags/russia.svg';
import ukraineFlag from '@/assets/images/flags/ukraine.svg';
import southAfricaFlag from '@/assets/images/flags/south_africa.svg';
import chinaFlag from '@/assets/images/flags/china.svg';
import canadaFlag from '@/assets/images/flags/canada.svg';
import venezuelaFlag from '@/assets/images/flags/venezuela.svg';
import puertoRicoFlag from '@/assets/images/flags/puerto_rico.svg';

export const Nationality = {
  Japan: "Japan",
  Mexico: "Mexico",
  USA: "USA",
  Kazakhstan: "Kazakhstan",
  UK: "UK",
  Russia: "Russia",
  Philippines: "Philippines",
  Ukraine: "Ukraine",
  Canada: "Canada",
  Venezuela: "Venezuela",
  SouthAfrica: "SouthAfrica",
  China: "China",
  PuertoRico: "PuertoRico",
} as const


export const getNationalFlag = (country: NationalityType) => {
  if (country == Nationality.Japan) return japanFlag;
  if (country == Nationality.Philippines) return philippinesFlag;
  if (country == Nationality.USA) return usaFlag;
  if (country == Nationality.Mexico) return mexicoFlag;
  if (country == Nationality.Kazakhstan) return kazakhstanFlag;
  if (country == Nationality.UK) return ukFlag;
  if (country == Nationality.Russia) return russiaFlag;
  if (country == Nationality.Ukraine) return ukraineFlag;
  if (country == Nationality.SouthAfrica) return southAfricaFlag;
  if (country == Nationality.China) return chinaFlag;
  if (country == Nationality.Canada) return canadaFlag;
  if (country == Nationality.Venezuela) return venezuelaFlag;
  if (country == Nationality.PuertoRico) return puertoRicoFlag;
};


export const formatPosition = (country: NationalityType) => {
  if (country == Nationality.UK) return '25% 30%';
  if (country == Nationality.Russia) return '25% 75%';
  if (country == Nationality.SouthAfrica) return '25% 30%';
  if (country == Nationality.Mexico) return '25% 40%';
  if (country == Nationality.China) return '25% 25%';
  return 'center';
};