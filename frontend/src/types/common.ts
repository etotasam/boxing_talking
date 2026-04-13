import { COUNTRY } from "@/constants/country";

export type UserType = {
  name: string | undefined;
};

export type CountryType = typeof COUNTRY[keyof typeof COUNTRY];
