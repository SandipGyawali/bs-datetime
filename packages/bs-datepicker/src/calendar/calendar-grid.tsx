import React, { useId } from "react";
import { useCalendar } from "./calendar-context";
import { CALENDAR_LABELS, NepaliDate } from "bs-datetime";
import { cn } from "../lib/cn";
import type { CalendarProps } from "./calendar";
import { useFormatNumber } from "./calendar-utils";

const today = new NepaliDate();
console.log(new NepaliDate(new NepaliDate().setMonth(-1)).toString());
export default function CalendarGrid({
  locale,
  weekends,
  showAdjacentMonthDates,
}: Required<
  Pick<CalendarProps, "locale" | "weekends" | "showAdjacentMonthDates">
>) {
  const gridId = useId();

  const { currentViewerDate } = useCalendar();

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

  const [days] = React.useMemo(() => {
    const weekend = Math.max(...weekends);

    const daysArray: Array<{
      label: string;
      value: number;
      currentMonth: boolean;
      prevMonth: boolean;
      nextMonth: boolean;
    }> = [];

    const todayWeekdayIndex = currentViewerDate.getDay();
    const todayDate = currentViewerDate.getDate() + 1;
    const endDate = currentViewerDate.get.endOfMonth().getDate();

    const _startDay = todayWeekdayIndex - (todayDate % 7) + 1;
    const startDay =
      ((_startDay >= 0 ? _startDay : 7 + _startDay) - weekend + 6) % 7;

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

    return [daysArray, todayDate] as const;
  }, [currentViewerDate, locale, showAdjacentMonthDates, ...weekends]);

  return (
    <div className="grid grid-cols-7 text-xs gap-1 w-full mt-3 text-center">
      {dayLabels.map((item) => (
        <span className="font-semibold" key={`${gridId}-${item}`}>
          {item}
        </span>
      ))}
      {days.map((item) => (
        <button
          key={`${gridId}-${item.value}-${item.currentMonth}-${item.prevMonth}`}
          className={cn("p-1 rounded", {
            "text-neutral-400": !item.currentMonth,
            "bg-green-100":
              item.value === today.getDate() + 1 &&
              currentViewerDate.getFullYear() === today.getFullYear() &&
              currentViewerDate.getMonth() === today.getMonth(),
          })}
          disabled={!item.label}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
