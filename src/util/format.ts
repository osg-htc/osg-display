import { Timespan } from "./gracc";

/**
 * Formats a number to be "clean," i.e. rounded to the nearest thousand."
 * @param n number to format
 * @returns a formatted number string
 */
export function formatNumber(n: number): string {
  const roundedNumber = Math.round(n / 1000) * 1000;

  return roundedNumber.toLocaleString("en-US");
}

/**
 * Formats a date for the histogram generation, based on the timespan.
 * @param date the date to format
 * @param timespan the timespan for the current histogram
 * @returns a formatted date string
 */
export function formatDate(date: Date, timespan: Timespan): string {
  switch (timespan) {
    case "daily":
      return date.toLocaleString("en-US", {
        month: "numeric", // UTC not used because we need accurate time
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    case "monthly":
      return date.toLocaleString("en-US", {
        timeZone: "UTC", // UTC used because the ES buckets use UTC (and sometimes cause the day to be 1 off)
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
    case "yearly":
      return date.toLocaleString("en-US", {
        timeZone: "UTC", // UTC used because the ES buckets use UTC (and sometimes cause the day to be 1 off)
        month: "long",
        year: "numeric",
      });
  }
}
