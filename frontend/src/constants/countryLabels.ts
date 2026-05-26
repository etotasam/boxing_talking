import { COUNTRY } from '@/constants/country';

export const COUNTRY_LABELS = {
  [COUNTRY.JAPAN]: '日本',
  [COUNTRY.MEXICO]: 'メキシコ',
  [COUNTRY.USA]: 'アメリカ',
  [COUNTRY.KAZAKHSTAN]: 'カザフスタン',
  [COUNTRY.UK]: 'イギリス',
  [COUNTRY.RUSSIA]: 'ロシア',
  [COUNTRY.PHILIPPINES]: 'フィリピン',
  [COUNTRY.UKRAINE]: 'ウクライナ',
  [COUNTRY.CANADA]: 'カナダ',
  [COUNTRY.VENEZUELA]: 'ベネズエラ',
  [COUNTRY.SOUTH_AFRICA]: '南アフリカ',
  [COUNTRY.CHINA]: '中国',
  [COUNTRY.PUERTO_RICO]: 'プエルトリコ',
  [COUNTRY.SAUDI_ARABIA]: 'サウジアラビア',
  [COUNTRY.GHANA]: 'ガーナ',
  [COUNTRY.AUSTRALIA]: 'オーストラリア',
  [COUNTRY.UZBEKISTAN]: 'ウズベキスタン',
  [COUNTRY.ARGENTINA]: 'アルゼンチン',
  [COUNTRY.IRELAND]: 'アイルランド',
  [COUNTRY.THAILAND]: 'タイ',
} as const satisfies Record<(typeof COUNTRY)[keyof typeof COUNTRY], string>;
