import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(duration);
dayjs.extend(advancedFormat);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "1 minute",
    mm: "%d minutes",
    h: "1 hour",
    hh: "%d hours",
    d: "1 day",
    dd: "%d days",
    M: "1 month",
    MM: "%d months",
    y: "1 year",
    yy: "%d years",
  },
});

export const durationFromNow = (d: Date) => dayjs(d).locale("en").fromNow(true);

export const formatSecondsToMinutes = (sec: number) =>
  dayjs.duration(sec * 1000).format("mm:ss");

export const formatMilisecondsToMinutes = (milisec: number) =>
  dayjs.duration(milisec).format("mm:ss");
