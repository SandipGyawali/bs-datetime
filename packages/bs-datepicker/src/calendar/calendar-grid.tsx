import React, { useId, useRef, useState } from "react";
import { useCalendar } from "./calendar-context";
import { CALENDAR_LABELS, NepaliDate } from "bs-datetime";
import { cn } from "../lib/cn";
import type { CalendarProps } from "./calendar";
import { useFormatNumber } from "./calendar-utils";

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

  const { currentViewerDate, setCurrentViewerDate } = useCalendar();

  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<Array<HTMLButtonElement>>([]);
  const focusChangeRef = useRef(false);

  const [currentTabbableButton, setCurrentTabbableButton] = useState(0);

  const dayLabels = React.useMemo(() => {
    const weekend = Math.max(...weekends);
    const weekDays = CALENDAR_LABELS.weekdays[locale].short.slice();
    const weekendLabel = weekDays[weekend];

    if (weekend > 6)
      throw new Error(
        `Maximum weekend end can't be greater than 6. ${weekend} provided.`
      );

    while (true) {
      if (weekendLabel === weekDays[weekDays.length - 1]) {
        break;
      }

      weekDays.unshift(weekDays.pop()!); // rotate labels until its done
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

        const prevMonthEnd = prevMonth.get.endOfMonth().getDate() + 1;

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

      Array(endDate)
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

  const changeMonth = (num: number) => {
    currentViewerDate.setMonth(currentViewerDate.getMonth() + num);

    const newMonth = new NepaliDate(currentViewerDate);
    setCurrentViewerDate(newMonth);

    return newMonth;
  };

  const handleFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let btnIndex = -1;
    switch (e.code) {
      case "ArrowUp":
        if (currentTabbableButton - 7 < currentMonthStartIndex) {
          const newMonth = changeMonth(-1);
          const newMonthEnd = newMonth.get.endOfMonth().getDate();
          const start = getStartDay(newMonth, weekend);

          btnIndex =
            Math.floor((start + newMonthEnd) / 7) * 7 -
            (currentTabbableButton % 7) +
            1;
          if (btnIndex + 7 < start + newMonthEnd) btnIndex += 7;
        } else {
          btnIndex = currentTabbableButton - 7;
        }
        break;
      case "ArrowDown":
        if (
          currentTabbableButton + 7 >=
          currentMonthStartIndex + currentMonthDaysCount
        ) {
          const newMonth = changeMonth(1);
          const start = getStartDay(newMonth, weekend);
          btnIndex = currentTabbableButton % 7;
          if (btnIndex < start) btnIndex += 7;
        } else {
          btnIndex = currentTabbableButton + 7;
        }
        break;

      case "ArrowLeft":
        if (currentTabbableButton === currentMonthStartIndex) {
          const newMonth = changeMonth(-1);
          const start = getStartDay(newMonth, weekend);
          btnIndex = start + newMonth.get.endOfMonth().getDate() - 1;
        } else {
          btnIndex = currentTabbableButton - 1;
        }
        break;
      case "ArrowRight":
        if (
          currentTabbableButton ===
          currentMonthStartIndex + currentMonthDaysCount - 1
        ) {
          const newMonth = changeMonth(1);
          const start = getStartDay(newMonth, weekend);
          btnIndex = start;
        } else {
          btnIndex = currentTabbableButton + 1;
        }
        break;
    }

    console.log(btnIndex);
    if (btnIndex > -1) {
      focusChangeRef.current = true;
      setCurrentTabbableButton(btnIndex);
    }
  };

  const selectDate = (day: (typeof days)[number], index: number) => {
    if (!day.currentMonth) return;

    setCurrentTabbableButton(index);
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
            "bg-green-100":
              item.value === today.getDate() + 1 &&
              currentViewerDate.getFullYear() === today.getFullYear() &&
              currentViewerDate.getMonth() === today.getMonth(),
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

const getStartDay = (date: NepaliDate, weekend: number) => {
  const todayWeekdayIndex = date.getDay();
  const todayDate = date.getDate() + 1;

  const _startDay = todayWeekdayIndex - (todayDate % 7) + 1;
  const startDay =
    ((_startDay >= 0 ? _startDay : 7 + _startDay) - weekend + 6) % 7;

  return startDay;
};
