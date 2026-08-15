import type { CurrencyCode, Language } from '../types';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  name_fa: string;
  rateToUSD: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  DKK: {
    code: 'DKK',
    symbol: 'kr.',
    name: 'Danish Krone',
    name_fa: 'کرون دانمارک',
    rateToUSD: 0.15,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    name_fa: 'دلار آمریکا',
    rateToUSD: 1,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    name_fa: 'یورو',
    rateToUSD: 1.08,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    name_fa: 'پوند انگلیس',
    rateToUSD: 1.28,
  },
  IRT: {
    code: 'IRT',
    symbol: 'تومان',
    name: 'Iranian Toman',
    name_fa: 'تومان',
    rateToUSD: 0.000016,
  },
  IRR: {
    code: 'IRR',
    symbol: 'ریال',
    name: 'Iranian Rial',
    name_fa: 'ریال',
    rateToUSD: 0.0000016,
  },
};

export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCode = 'DKK',
  lang: Language = 'en'
): string => {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.DKK;
  const isIranCurrency = currencyCode === 'IRT' || currencyCode === 'IRR';

  // Format with standard localization
  const formattedNumber = Math.abs(amount).toLocaleString(lang === 'fa' ? 'fa-IR' : 'da-DK', {
    minimumFractionDigits: isIranCurrency ? 0 : 2,
    maximumFractionDigits: isIranCurrency ? 0 : 2,
  });

  const sign = amount < 0 ? '-' : '';

  if (lang === 'fa') {
    const symbolFa = curr.name_fa;
    return `${sign}${formattedNumber} ${symbolFa}`;
  } else {
    if (currencyCode === 'DKK') {
      return `${sign}${formattedNumber} kr.`;
    }
    if (isIranCurrency) {
      return `${sign}${formattedNumber} ${curr.code}`;
    }
    return `${sign}${curr.symbol}${formattedNumber}`;
  }
};
