import React, { useId, useRef, useState } from "react";
import { useCalendar } from "./calendar-context";
import { CALENDAR_LABELS, NepaliDate } from "bs-datetime";
import { cn } from "../lib/cn";
import type { CalendarProps } from "./calendar";
import { getStartDay, useFormatNumber } from "./calendar-utils";

const today = new NepaliDate();
export default function CalendarGrid({
  locale,
  weekends,
  showAdjacentMonthDates,
}: Required<
  Pick<CalendarProps, "locale" | "weekends" | "showAdjacentMonthDates">
>) {
  const gridId = useId();
  const weekend = Math.max(...weekends);

  const {
    currentViewerDate,
    setCurrentViewerDate,
    selectedDate,
    setSelectedDate,
  } = useCalendar();

  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<Array<HTMLButtonElement>>([]);
  const focusChangeRef = useRef(false);

  const [currentTabbableButton, setCurrentTabbableButton] = useState(() => {
    const startDay = getStartDay(selectedDate || currentViewerDate, weekend);
    return startDay + (selectedDate || currentViewerDate).getDate() - 1;
  });

  const dayLabels = React.useMemo(() => {
    const weekDays = CALENDAR_LABELS.weekdays[locale].short.slice();
    const weekendLabel = weekDays[weekend];

    if (weekend > 6)
      throw new Error(
        `Maximum weekend end can't be greater than 6. ${weekend} provided.`
      );

    // rotate labels until weekend is in the end of
    while (true) {
      if (weekendLabel === weekDays[weekDays.length - 1]) {
        break;
      }

      weekDays.unshift(weekDays.pop()!);
    }

    return weekDays;
  }, [locale, ...weekends]);

  const { formatLabel } = useFormatNumber(locale);

  const [days, currentMonthDaysCount, currentMonthStartIndex] =
    React.useMemo(() => {
      const daysArray: Array<{
        label: string;
        value: number;
        currentMonth: boolean;
        prevMonth: boolean;
        nextMonth: boolean;
      }> = [];

      const endDate = currentViewerDate.get.endOfMonth().getDate();
      const startDay = getStartDay(currentViewerDate, weekend);

      if (startDay > 0) {
        const prevMonth = new NepaliDate(currentViewerDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        const prevMonthEnd = prevMonth.get.endOfMonth().getDate();

        const prevMonthDayStart = prevMonthEnd - startDay;

        Array(startDay)
          .fill(0)
          .forEach((_, index) => {
            daysArray.push({
              currentMonth: false,
              nextMonth: false,
              prevMonth: true,
              label: showAdjacentMonthDates
                ? formatLabel(prevMonthDayStart + index)
                : "",
              value: prevMonthDayStart + index,
            });
          });
      }

      Array(endDate - 1)
        .fill(0)
        .forEach((_, index) => {
          daysArray.push({
            currentMonth: true,
            nextMonth: false,
            label: formatLabel(index + 1),
            prevMonth: false,
            value: index + 1,
          });
        });

      const futureDates = daysArray.length % 7;
      Array(futureDates === 0 ? 0 : 7 - futureDates)
        .fill(0)
        .forEach((_, index) => {
          return daysArray.push({
            currentMonth: false,
            nextMonth: true,
            label: showAdjacentMonthDates ? formatLabel(index + 1) : "",
            prevMonth: false,
            value: index + 1,
          });
        });

      return [daysArray, endDate, startDay] as const;
    }, [currentViewerDate, locale, showAdjacentMonthDates, ...weekends]);

  /**
   * Changes the month of the currentViewerDate by num relative to current month
   * @param num number to move month by
   * @returns NepaliDate instance with the new month change applied
   */
  const changeMonth = (num: number) => {
    currentViewerDate.setMonth(currentViewerDate.getMonth() + num);

    const newMonth = new NepaliDate(currentViewerDate);
    setCurrentViewerDate(newMonth);

    return newMonth;
  };

  /**
   * Handles focus of the grid items when navigated via the keyboard
   */
  const handleFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let btnIndex = -1;
    switch (e.code) {
      case "ArrowUp":
        /**
         * Check if moving up (7 days back) would go to the previous month
         */
        if (currentTabbableButton - 7 < currentMonthStartIndex) {
          const newMonth = changeMonth(-1);

          /**
           * Get the index of the last day of the previous month
           */
          const newMonthEnd = newMonth.get.endOfMonth().getDate() - 1;

          /**
           * Calculate the weekday index of the first day of the previous month
           */
          const start = getStartDay(newMonth, weekend);

          /**
           * Calculate the last button index of the whose day is the same as the
           * current focused button
           */
          btnIndex =
            Math.floor((start + newMonthEnd) / 7) * 7 +
            (currentTabbableButton % 7);

          /**
           * if btnIndex is higher than the month itself, then subtract 7
           */
          if (btnIndex >= start + newMonthEnd) btnIndex -= 7;
        } else {
          /**
           * Move up (7 days back) within the current month
           */
          btnIndex = currentTabbableButton - 7;
        }
        break;
      case "ArrowDown":
        // Check if moving down (7 days forward) would go to the next month
        if (
          currentTabbableButton + 7 >=
          currentMonthStartIndex + currentMonthDaysCount - 1
        ) {
          const newMonth = changeMonth(1);
          const start = getStartDay(newMonth, weekend);

          // Calculate the button index in the next month which is the same day
          btnIndex = currentTabbableButton % 7;

          // Offset the day if the month doesn't start before the day
          if (btnIndex < start) btnIndex += 7;
        } else {
          // Move down (7 days forward) within the current month
          btnIndex = currentTabbableButton + 7;
        }
        break;

      case "ArrowLeft":
        /**
         * we're on the first day, so go to the previous month and set the
         * focus to the last day of the last month.
         */
        if (currentTabbableButton === currentMonthStartIndex) {
          const newMonth = changeMonth(-1);
          const start = getStartDay(newMonth, weekend);
          btnIndex = start + newMonth.get.endOfMonth().getDate() - 2;
        } else {
          /**
           * if we're not at the first day, we can safely move to the previous day
           */
          btnIndex = currentTabbableButton - 1;
        }
        break;
      case "ArrowRight":
        /**
         * we're on the last day, so go to the next month and set the focus to the
         * first day of the next month.
         */
        if (
          currentTabbableButton ===
          currentMonthStartIndex + currentMonthDaysCount - 2
        ) {
          const newMonth = changeMonth(1);
          const start = getStartDay(newMonth, weekend);
          btnIndex = start;
        } else {
          /**
           * if we're not at the last day, we can safely move to the next day
           */
          btnIndex = currentTabbableButton + 1;
        }
        break;
      case "Return":
        /**
         * select the current day
         */
        selectDate(days[currentTabbableButton], currentTabbableButton);
        break;
    }

    if (btnIndex > -1) {
      focusChangeRef.current = true;
      setCurrentTabbableButton(btnIndex);
    }
  };

  const selectDate = (day: (typeof days)[number], index: number) => {
    if (!day.currentMonth) return;

    setCurrentTabbableButton(index);

    const date = new NepaliDate(currentViewerDate);
    date.setDate(day.value);

    setSelectedDate(date);
  };

  React.useLayoutEffect(() => {
    if (focusChangeRef.current) {
      btnRef.current[currentTabbableButton]?.focus();
      focusChangeRef.current = false;
    }
  }, [currentTabbableButton]);

  return (
    <div
      className="grid grid-cols-7 text-xs gap-1 w-full mt-3 text-center"
      ref={containerRef}
      onKeyDown={handleFocus}
    >
      {dayLabels.map((item) => (
        <span className="font-semibold" key={`${gridId}-${item}`}>
          {item}
        </span>
      ))}
      {days.map((item, index) => (
        <button
          onClick={() => selectDate(item, index)}
          key={`${gridId}-${item.value}-${item.currentMonth}-${item.prevMonth}`}
          ref={(e) => {
            if (e) btnRef.current[index] = e;
          }}
          className={cn("p-1 rounded", {
            "text-neutral-400": !item.currentMonth,
            "bg-neutral-200":
              item.currentMonth &&
              item.value === today.getDate() &&
              currentViewerDate.getFullYear() === today.getFullYear() &&
              currentViewerDate.getMonth() === today.getMonth(),
            "bg-neutral-800 text-white":
              item.currentMonth &&
              item.value === selectedDate?.getDate() &&
              selectedDate?.getFullYear() === currentViewerDate.getFullYear() &&
              selectedDate?.getMonth() === currentViewerDate.getMonth(),
          })}
          disabled={!item.label}
          tabIndex={currentTabbableButton === index ? 0 : -1}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
