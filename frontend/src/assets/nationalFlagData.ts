// ! types
import { CountryType } from '@/assets/types';
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
import saudiArabiaFlag from '@/assets/images/flags/saudi_arabia.svg';
import ghanaFlag from '@/assets/images/flags/ghana.svg';
import australiaFlag from '@/assets/images/flags/australia.svg';
import uzbekistanFlag from '@/assets/images/flags/uzbekistan.svg';
import argentinaFlag from "@/assets/images/flags/argentina.svg"
import irelandFlag from "@/assets/images/flags/ireland.svg"

export const COUNTRY = {
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
  SAUDI_ARABIA: "SaudiArabia",
  GHANA: "Ghana",
  AUSTRALIA: "Australia",
  UZBEKISTAN: "Uzbekistan",
  ARGENTINA: "Argentina",
  IRELAND: "Ireland"
} as const


export const getNationalFlag = (country: CountryType) => {
  if (country == COUNTRY.JAPAN) return japanFlag;
  if (country == COUNTRY.PHILIPPINES) return philippinesFlag;
  if (country == COUNTRY.USA) return usaFlag;
  if (country == COUNTRY.MEXICO) return mexicoFlag;
  if (country == COUNTRY.KAZAKHSTAN) return kazakhstanFlag;
  if (country == COUNTRY.UK) return ukFlag;
  if (country == COUNTRY.RUSSIA) return russiaFlag;
  if (country == COUNTRY.UKRAINE) return ukraineFlag;
  if (country == COUNTRY.SOUTH_AFRICA) return southAfricaFlag;
  if (country == COUNTRY.CHINA) return chinaFlag;
  if (country == COUNTRY.CANADA) return canadaFlag;
  if (country == COUNTRY.VENEZUELA) return venezuelaFlag;
  if (country == COUNTRY.PUERTO_RICO) return puertoRicoFlag;
  if (country == COUNTRY.SAUDI_ARABIA) return saudiArabiaFlag;
  if (country == COUNTRY.GHANA) return ghanaFlag;
  if (country == COUNTRY.AUSTRALIA) return australiaFlag;
  if (country == COUNTRY.UZBEKISTAN) return uzbekistanFlag;
  if (country == COUNTRY.ARGENTINA) return argentinaFlag;
  if (country == COUNTRY.IRELAND) return irelandFlag;
};


export const formatPosition = (country: CountryType) => {
  // if (country == COUNTRY.USA) return '25% 20%';
  // if (country == COUNTRY.UK) return '25% 30%';
  // if (country == COUNTRY.UZBEKISTAN) return '25% 20%';
  // if (country == COUNTRY.SOUTH_AFRICA) return '25% 30%';
  // if (country == COUNTRY.MEXICO) return '25% 40%';
  // if (country == COUNTRY.CHINA) return '25% 25%';
  // if (country == COUNTRY.VENEZUELA) return '25% 35%';
  // if (country == COUNTRY.GHANA) return '25% 35%';
  // if (country == COUNTRY.AUSTRALIA) return '25% 35%';
  return 'center';
};