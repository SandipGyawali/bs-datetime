import { NepaliDate } from "bs-datetime";
import React, { useEffect, useRef } from "react";

type CalendarContext = {
  currentViewerDate: NepaliDate;
  setCurrentViewerDate: React.Dispatch<React.SetStateAction<NepaliDate>>;
  selectedDate: NepaliDate;
  setSelectedDate: React.Dispatch<React.SetStateAction<NepaliDate>>;
};

const CalendarContext = React.createContext<CalendarContext>(null!);

const isFn = (fn: any): fn is Function =>
  ({}).toString.call(fn) === "[object Function]";

const useCalendar = () => {
  const value = React.useContext(CalendarContext);

  if (!value) throw new Error("No Calendar Context found!");

  return value;
};

const CalendarProvider = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: NepaliDate;
  onValueChange?: (date: NepaliDate) => void;
}) => {
  const setValueRef = useRef(onValueChange);
  setValueRef.current = onValueChange;

  const [currentViewerDate, setCurrentViewerDate] = React.useState(
    () => value || new NepaliDate()
  );
  const [selectedDate, _setSelectedDate] = React.useState(
    () => value || new NepaliDate()
  );

  React.useEffect(() => {
    if (!value) return;
    _setSelectedDate(value);
  }, [value?.toString()]);

  const setSelectedDate = React.useCallback(
    (fnOrValue: NepaliDate | ((prev: NepaliDate) => NepaliDate)) => {
      if (!isFn(fnOrValue)) {
        _setSelectedDate(fnOrValue);
        setValueRef.current?.(fnOrValue);
        return;
      }
      _setSelectedDate((date) => {
        const value = fnOrValue(date);
        setValueRef.current?.(value);
        return value;
      });
    },
    []
  );

  return (
    <CalendarContext.Provider
      value={{
        currentViewerDate,
        setCurrentViewerDate,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export { useCalendar, CalendarProvider };
