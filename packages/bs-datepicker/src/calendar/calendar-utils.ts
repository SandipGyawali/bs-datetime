import React from "react";
import type { CalendarProps } from "./calendar";

const UNICODE_DIFFERENCE = 0x0936;
const NUMERAL_START_CODE = 0x0030;

export function toHinduArabicNumber(n: number | string) {
  let out = "";
  const str = n.toString();
  const strlen = str.length;

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
