import en from '../../messages/en.json';

type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}

export type TranslationKeys = keyof IntlMessages;
export type NestedTranslationKeys<T = IntlMessages> = {
  [K in keyof T]: T[K] extends string
    ? K
    : T[K] extends object
    ? `${K & string}.${NestedTranslationKeys<T[K]> & string}`
    : never;
}[keyof T];