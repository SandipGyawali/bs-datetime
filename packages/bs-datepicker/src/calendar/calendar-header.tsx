import React, { useMemo } from "react";
import { useCalendar } from "./calendar-context";
import { CALENDAR_LABELS, NepaliDate } from "bs-datetime";
import {
  ChevronDoubleLeft,
  ChevronDoubleRight,
  ChevronLeft,
  ChevronRight,
} from "./icons";
import { cn } from "../lib/cn";
import type { CalendarProps } from "./calendar";
import { useFormatNumber } from "./calendar-utils";

const NavigationButton = ({
  onClick,
  disabled,
  children,
  className = "",
}: {
  onClick(): void;
  disabled: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <button
      className={cn(
        "block p-2 rounded border-neutral-200 border disabled:text-neutral-400 disabled:bg-neutral-200 transition-colors disabled:cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export function CalendarHeader({
  locale,
  showYearNavigation,
}: Required<Pick<CalendarProps, "locale" | "showYearNavigation">>) {
  const { currentViewerDate, setCurrentViewerDate } = useCalendar();

  const { formatLabel } = useFormatNumber(locale);

  const currentValue = useMemo(() => {
    const date = currentViewerDate.getDate();
    const month = currentViewerDate.getMonth();
    const year = currentViewerDate.getFullYear();

    return `${formatLabel(date)} ${CALENDAR_LABELS.months[locale].full[month]}, ${formatLabel(year)}`;
  }, [currentViewerDate, locale]);

  const prevMonth = (num: number) => {
    currentViewerDate.setMonth(currentViewerDate.getMonth() - num);

    setCurrentViewerDate(new NepaliDate(currentViewerDate));
  };

  const nextMonth = (num: number) => {
    currentViewerDate.setMonth(currentViewerDate.getMonth() + num);

    setCurrentViewerDate(new NepaliDate(currentViewerDate));
  };

  const isNextYearDisabled =
    NepaliDate.MAX_YEAR === currentViewerDate.getFullYear();
  const isNextMonthDisabled =
    isNextYearDisabled && currentViewerDate.getMonth() === 11;

  const isPrevYearDisabled =
    NepaliDate.MIN_YEAR === currentViewerDate.getFullYear();
  const isPrevMonthDisabled =
    isPrevYearDisabled && currentViewerDate.getMonth() === 0;

  return (
    <div className="flex items-center gap-2">
      {showYearNavigation && (
        <NavigationButton
          onClick={() => prevMonth(12)}
          disabled={isPrevYearDisabled}
        >
          <ChevronDoubleLeft />
        </NavigationButton>
      )}
      <NavigationButton
        onClick={() => prevMonth(1)}
        disabled={isPrevMonthDisabled}
      >
        <ChevronLeft />
      </NavigationButton>
      <NavigationButton
        disabled={false}
        onClick={() => {}}
        className="block px-5 w-[20ch] text-xs text-center text-neutral-800"
      >
        {currentValue}
      </NavigationButton>
      <NavigationButton
        onClick={() => nextMonth(1)}
        disabled={isNextMonthDisabled}
      >
        <ChevronRight />
      </NavigationButton>
      {showYearNavigation && (
        <NavigationButton
          onClick={() => nextMonth(12)}
          disabled={isNextYearDisabled}
        >
          <ChevronDoubleRight />
        </NavigationButton>
      )}
    </div>
  );
}
