import { NepaliDate } from "bs-datetime";
import React from "react";

type CalendarContext = {
  currentViewerDate: NepaliDate;
  setCurrentViewerDate: React.Dispatch<React.SetStateAction<NepaliDate>>;
};

const CalendarContext = React.createContext<CalendarContext>(null!);

const useCalendar = () => {
  const value = React.useContext(CalendarContext);

  if (!value) throw new Error("No Calendar Context found!");

  return value;
};

const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentViewerDate, setCurrentViewerDate] = React.useState(
    () => new NepaliDate()
  );

  return (
    <CalendarContext.Provider
      value={{
        currentViewerDate,
        setCurrentViewerDate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export { useCalendar, CalendarProvider };
