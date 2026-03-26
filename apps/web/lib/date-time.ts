export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function formatDateKey(date: Date, timeZone = getBrowserTimeZone()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to build date key for timezone ${timeZone}.`);
  }

  return `${year}-${month}-${day}`;
}

export function formatMonthKey(date: Date, timeZone = getBrowserTimeZone()) {
  return formatDateKey(date, timeZone).slice(0, 7);
}
