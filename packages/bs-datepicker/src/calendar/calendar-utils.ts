import React from "react";
import type { CalendarProps } from "./calendar";
import type { NepaliDate } from "bs-datetime";

// difference for the roman numerals and hindu arabic numerals in unicode.
const UNICODE_DIFFERENCE = 0x0936;

// start char code for 0
const NUMERAL_START_CODE = 0x0030;

/**
 * Converts a number or a string containing number to hindu arabic number.
 *
 * @param n the number or string to convert to hindu arabic number.
 * @returns string containing hindu arabic number
 */
export function toHinduArabicNumber(n: number | string) {
  let out = "";
  const str = n.toString();
  const strlen = str.length;

  // loop over each character and replace it with hindu arabic number if its a number
  for (let i = 0; i < strlen; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode >= NUMERAL_START_CODE && charCode < NUMERAL_START_CODE + 10) {
      out += String.fromCharCode(charCode + UNICODE_DIFFERENCE);
    } else {
      out += str[i];
    }
  }

  return out;
}

/**
 * @param locale en for english, or np for devanagari
 * @returns an object containing a function `formatLabel` that returns hindu arabic number if locale is set to np
 */
export const useFormatNumber = (locale: CalendarProps["locale"]) => {
  const formatLabel = React.useCallback(
    (value: number) => {
      if (locale === "en") return `${value}`;

      return toHinduArabicNumber(value);
    },
    [locale]
  );

  return { formatLabel };
};

/**
 * Return the index of day of the start of the month.
 *
 * @param date date whose month's start day
 * @param weekend index of day of the start of the month (0-6 [sun-sat])
 * @returns
 */
export const getStartDay = (date: NepaliDate, weekend: number) => {
  const todayWeekdayIndex = date.getDay();
  const todayDate = date.getDate();

  /**
   * _startDay is the calculated value of day of the first day of the given month.
   *
   * todayDate % 7 gives the relative position of today's date in the week.
   * Subtracting this from todayWeekdayIndex effectively moves back to the relative weekday of the first day.
   * Adding 1 adjusts for how indexes align with the first day of the month.
   *
   * if today's date is 23 and its Tuesday (day index: 2), then, _startDay would
   * be 1, which means, the start of the month is Monday
   *
   * if today's date is 23 and its Saturday (day index: 6), then, _startDay would
   * be -2, which means, the start of the month is 2nd from the last, i.e Friday
   */
  const _startDay = todayWeekdayIndex - (todayDate % 7) + 1;

  /**
   * The formula for startDay normalizes _startDay to a valid weekday index (0–6) and incorporates the weekend adjustment,
   * i.e. adjusts startDay based on an arbitrary weekend value (0-6) treating the weekend value as the last day index.
   */
  const startDay =
    ((_startDay >= 0 ? _startDay : 7 + _startDay) - weekend + 6) % 7;

  return startDay;
};
