import React from 'react';
import {
  AR as ArgentinaFlag,
  AU as AustraliaFlag,
  CA as CanadaFlag,
  CN as ChinaFlag,
  GB as UkFlag,
  GH as GhanaFlag,
  IE as IrelandFlag,
  JP as JapanFlag,
  KZ as KazakhstanFlag,
  MX as MexicoFlag,
  PH as PhilippinesFlag,
  PR as PuertoRicoFlag,
  RU as RussiaFlag,
  SA as SaudiArabiaFlag,
  TH as ThailandFlag,
  UA as UkraineFlag,
  US as UsaFlag,
  UZ as UzbekistanFlag,
  VE as VenezuelaFlag,
  ZA as SouthAfricaFlag,
} from 'country-flag-icons/react/3x2';
import { COUNTRY } from '@/constants/country';
import { CountryType } from '@/types';

type FlagComponent = (
  props: React.HTMLAttributes<HTMLElement & SVGElement> &
    React.SVGAttributes<HTMLElement & SVGElement>
) => React.JSX.Element;

const nationalFlags = {
  [COUNTRY.JAPAN]: JapanFlag,
  [COUNTRY.MEXICO]: MexicoFlag,
  [COUNTRY.USA]: UsaFlag,
  [COUNTRY.KAZAKHSTAN]: KazakhstanFlag,
  [COUNTRY.UK]: UkFlag,
  [COUNTRY.RUSSIA]: RussiaFlag,
  [COUNTRY.PHILIPPINES]: PhilippinesFlag,
  [COUNTRY.UKRAINE]: UkraineFlag,
  [COUNTRY.CANADA]: CanadaFlag,
  [COUNTRY.VENEZUELA]: VenezuelaFlag,
  [COUNTRY.SOUTH_AFRICA]: SouthAfricaFlag,
  [COUNTRY.CHINA]: ChinaFlag,
  [COUNTRY.PUERTO_RICO]: PuertoRicoFlag,
  [COUNTRY.SAUDI_ARABIA]: SaudiArabiaFlag,
  [COUNTRY.GHANA]: GhanaFlag,
  [COUNTRY.AUSTRALIA]: AustraliaFlag,
  [COUNTRY.UZBEKISTAN]: UzbekistanFlag,
  [COUNTRY.ARGENTINA]: ArgentinaFlag,
  [COUNTRY.IRELAND]: IrelandFlag,
  [COUNTRY.THAILAND]: ThailandFlag,
} as const satisfies Record<CountryType, FlagComponent>;

export const getNationalFlag = (country: CountryType) => {
  return nationalFlags[country];
};
