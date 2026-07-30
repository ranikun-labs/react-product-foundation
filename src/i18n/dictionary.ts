import type { Locale } from '@/constants/routes';
import { en } from '@/i18n/messages/en';
import { ko } from '@/i18n/messages/ko';

export interface Messages {
  common: {
    appName: string;
    starterReady: string;
  };
}

type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];

export type MessageKey = DotPaths<Messages>;
export const MESSAGES: Record<Locale, Messages> = { ko, en };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
