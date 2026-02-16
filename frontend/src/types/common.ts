import { COUNTRY } from "@/assets/nationalFlagData";

export type UserType = {
  name: string | undefined;
};

export type CountryType = typeof COUNTRY[keyof typeof COUNTRY];
