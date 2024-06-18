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
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

export const durationFromNow = (d: Date) => dayjs(d).locale("en").fromNow(true);

export const formatSecondsToMinutes = (sec: number) =>
  dayjs.duration(sec * 1000).format("mm:ss");

export const formatRemainingTime = (sec: number) => {
  const duration = dayjs.duration(sec * 1000);
  let str = duration.format("s") + "sec";

  const minutes = duration.format("m");

  if (minutes && minutes !== "0") {
    str = minutes + "min " + str;
  }

  const days: string = duration.format("D");
  if (days && days !== "0") {
    str = days + "day" + (Number(days) > 1 ? "s " : " ") + str;
  }

  return str;
};

export const formatMilisecondsToMinutes = (milisec: number) =>
  dayjs.duration(milisec).format("mm:ss");
