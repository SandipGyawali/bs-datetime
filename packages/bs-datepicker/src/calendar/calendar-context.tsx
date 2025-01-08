import { NepaliDate } from "bs-datetime";
import React, { useEffect, useRef } from "react";

type CalendarContext = {
  currentViewerDate: NepaliDate;
  setCurrentViewerDate: React.Dispatch<React.SetStateAction<NepaliDate>>;
  selectedDate?: NepaliDate;
  setSelectedDate: React.Dispatch<React.SetStateAction<NepaliDate | undefined>>;
};

const CalendarContext = React.createContext<CalendarContext>(null!);

const isFunction = (fn: any): fn is Function => fn instanceof Function;

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
  onValueChange?: (date: NepaliDate | undefined) => void;
}) => {
  const setValueRef = useRef(onValueChange);
  setValueRef.current = onValueChange;

  const [currentViewerDate, setCurrentViewerDate] = React.useState(
    () => value || new NepaliDate()
  );
  const [selectedDate, _setSelectedDate] = React.useState(value);

  React.useEffect(() => {
    if (!value) return;
    _setSelectedDate(value);
  }, [value?.toString()]);

  const setSelectedDate = React.useCallback(
    (
      fnOrValue:
        | NepaliDate
        | undefined
        | ((prev: NepaliDate | undefined) => NepaliDate | undefined)
    ) => {
      if (!isFunction(fnOrValue)) {
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
