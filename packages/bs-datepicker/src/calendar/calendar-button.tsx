import React from "react";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export const CalendarButton = ({
  className,
  ...props
}: {
  className: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button className={cn("", className)} {...props}></button>;
};
