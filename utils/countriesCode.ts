import { countries, TCountryCode } from 'countries-list';
// Utils
import { getEmojiFlag } from 'countries-list';

const COUNTRIES_CODE = Object.entries(countries).reduce(
  (acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        ...value,
        emoji: getEmojiFlag(key as TCountryCode),
        phoneCode: value.phone?.[0] ? `+${value.phone[0]}` : '',
      },
    };
  },
  {} as Record<
    string,
    (typeof countries)[keyof typeof countries] & { emoji: string; phoneCode: string }
  >,
);

export { COUNTRIES_CODE };
