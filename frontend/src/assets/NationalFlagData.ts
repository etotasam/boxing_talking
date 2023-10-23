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

export const NATIONALITY = {
  JAPAN: "Japan",
  MEXICO: "Mexico",
  USA: "USA",
  KAZAKHSTAN: "Kazakhstan",
  UK: "UK",
  RUSSIA: "Russia",
  PHILIPPINES: "Philippines",
  UKRAINE: "Ukraine",
  CANADA: "Canada",
  VENEZUELA: "Venezuela",
  SOUTH_AFRICA: "SouthAfrica",
  CHINA: "China",
  PUERTO_RICO: "PuertoRico",
} as const


export const getNationalFlag = (country: NationalityType) => {
  if (country == NATIONALITY.JAPAN) return japanFlag;
  if (country == NATIONALITY.PHILIPPINES) return philippinesFlag;
  if (country == NATIONALITY.USA) return usaFlag;
  if (country == NATIONALITY.MEXICO) return mexicoFlag;
  if (country == NATIONALITY.KAZAKHSTAN) return kazakhstanFlag;
  if (country == NATIONALITY.UK) return ukFlag;
  if (country == NATIONALITY.RUSSIA) return russiaFlag;
  if (country == NATIONALITY.UKRAINE) return ukraineFlag;
  if (country == NATIONALITY.SOUTH_AFRICA) return southAfricaFlag;
  if (country == NATIONALITY.CHINA) return chinaFlag;
  if (country == NATIONALITY.CANADA) return canadaFlag;
  if (country == NATIONALITY.VENEZUELA) return venezuelaFlag;
  if (country == NATIONALITY.PUERTO_RICO) return puertoRicoFlag;
};


export const formatPosition = (country: NationalityType) => {
  if (country == NATIONALITY.UK) return '25% 30%';
  if (country == NATIONALITY.RUSSIA) return '25% 75%';
  if (country == NATIONALITY.SOUTH_AFRICA) return '25% 30%';
  if (country == NATIONALITY.MEXICO) return '25% 40%';
  if (country == NATIONALITY.CHINA) return '25% 25%';
  return 'center';
};