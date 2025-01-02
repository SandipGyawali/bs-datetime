"use client";

import { Calendar } from "bs-datepicker";
import "bs-datepicker/styles.css";
import { CALENDAR_LABELS } from "bs-datetime";
import { useState } from "react";

export default function Page() {
  const [locale, setLocale] = useState("en" as "en" | "np");
  const [showYearNavigation, setShowYearNavigation] = useState(false);
  const [weekend, setWeekend] = useState(0);

  return (
    <main className="grid min-h-dvh place-items-center">
      <div>
        <label className="flex gap-4 items-center">
          <input
            type="checkbox"
            checked={locale === "np"}
            onChange={(e) => setLocale(e.target.checked ? "np" : "en")}
          />
          <span>Nepali Locale?</span>
        </label>
        <label className="flex gap-4 items-center mb-8">
          <input
            type="checkbox"
            checked={showYearNavigation}
            onChange={(e) => setShowYearNavigation(e.target.checked)}
          />
          <span>Show Year Navigation?</span>
        </label>
        <div>
          Weekend:
          <div className="items-center flex gap-4 mb-8">
            <button
              onClick={() =>
                setWeekend((w) => Math.max(0, Math.min(--w === -1 ? 7 : w, 6)))
              }
            >
              {"<-"}
            </button>
            <span className="w-[9ch]">
              {CALENDAR_LABELS.weekdays.en.full[weekend]}
            </span>
            <button
              onClick={() =>
                setWeekend((w) => Math.max(0, Math.min(++w % 7, 6)))
              }
            >
              {"->"}
            </button>
          </div>
        </div>
        <Calendar
          locale={locale}
          showYearNavigation={showYearNavigation}
          weekends={[weekend]}
        />
      </div>
    </main>
  );
}
