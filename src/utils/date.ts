import * as jalaali from 'jalaali-js';
import type { CalendarType, Language } from '../types';

export const GREGORIAN_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const GREGORIAN_MONTHS_FA = [
  'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
  'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
];

export const JALALI_MONTHS_FA = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export const JALALI_MONTHS_EN = [
  'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
  'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'
];

// Helper to convert English digits to Persian digits
export const toPersianDigits = (n: number | string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianNumbers[+w]);
};

// Format a date string (YYYY-MM-DD) according to selected calendar and language
export const formatDateDisplay = (
  dateStr: string,
  calendar: CalendarType = 'gregorian',
  lang: Language = 'en'
): string => {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const gy = parseInt(yearStr, 10);
  const gm = parseInt(monthStr, 10);
  const gd = parseInt(dayStr, 10);

  if (isNaN(gy) || isNaN(gm) || isNaN(gd)) return dateStr;

  if (calendar === 'jalali') {
    const j = jalaali.toJalaali(gy, gm, gd);
    const monthName = lang === 'fa' ? JALALI_MONTHS_FA[j.jm - 1] : JALALI_MONTHS_EN[j.jm - 1];
    if (lang === 'fa') {
      return `${toPersianDigits(j.jd)} ${monthName} ${toPersianDigits(j.jy)}`;
    }
    return `${monthName} ${j.jd}, ${j.jy}`;
  } else {
    const monthName = lang === 'fa' ? GREGORIAN_MONTHS_FA[gm - 1] : GREGORIAN_MONTHS_EN[gm - 1].slice(0, 3);
    if (lang === 'fa') {
      return `${toPersianDigits(gd)} ${monthName} ${toPersianDigits(gy)}`;
    }
    return `${monthName} ${gd}, ${gy}`;
  }
};

// Format a month string (YYYY-MM) for headers
export const formatMonthDisplay = (
  monthKey: string, // YYYY-MM
  calendar: CalendarType = 'gregorian',
  lang: Language = 'en'
): string => {
  if (!monthKey) return '';
  const [yearStr, monthStr] = monthKey.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  if (isNaN(y) || isNaN(m)) return monthKey;

  if (calendar === 'jalali') {
    const j = jalaali.toJalaali(y, m, 15);
    const monthName = lang === 'fa' ? JALALI_MONTHS_FA[j.jm - 1] : JALALI_MONTHS_EN[j.jm - 1];
    if (lang === 'fa') {
      return `${monthName} ${toPersianDigits(j.jy)}`;
    }
    return `${monthName} ${j.jy}`;
  } else {
    const monthName = lang === 'fa' ? GREGORIAN_MONTHS_FA[m - 1] : GREGORIAN_MONTHS_EN[m - 1];
    if (lang === 'fa') {
      return `${monthName} ${toPersianDigits(y)}`;
    }
    return `${monthName} ${y}`;
  }
};

// Get current month key in format YYYY-MM
export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Get today ISO string YYYY-MM-DD
export const getTodayISOString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Shift month by delta (-1 for previous, +1 for next)
export const shiftMonth = (monthKey: string, delta: number): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10) + delta;

  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }

  return `${y}-${String(m).padStart(2, '0')}`;
};

// Get previous N months array (e.g. for charts)
export const getRecentMonthKeys = (currentMonthKey: string, count: number = 6): string[] => {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    months.push(shiftMonth(currentMonthKey, -i));
  }
  return months;
};
