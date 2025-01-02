"use client";

import React from "react";
import { CalendarProvider } from "./calendar-context";
import CalendarGrid from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";

export type CalendarProps = {
  locale?: "en" | "np";
  showYearNavigation?: boolean;
  weekends?: number[];
  showAdjacentMonthDates?: boolean;
};

export function Calendar({
  locale = "en",
  showYearNavigation = false,
  weekends = [6],
  showAdjacentMonthDates = false,
}: CalendarProps) {
  return (
    <CalendarProvider>
      <div tabIndex={-1}>
        <CalendarHeader
          locale={locale}
          showYearNavigation={showYearNavigation}
        />
        <CalendarGrid
          locale={locale}
          weekends={weekends}
          showAdjacentMonthDates={showAdjacentMonthDates}
        />
      </div>
    </CalendarProvider>
  );
}
