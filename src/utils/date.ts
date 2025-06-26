export function extractDateParts(
  input: string | number | Date,
  locale: string = 'default',
): {
  date: number;
  month: string; // "Jun"
  fullMonth: string; // "June"
  year: number;
  day: string; // "Friday"
  weekdayShort: string; // "Fri"
  formatted: string; // "Fri, 27 June 2025"
  iso: string; // "2025-06-27T00:00:00.000Z"
  localeString: string; // "6/27/2025, 12:00:00 AM" (depends on locale)
} | null {
  const dateObj = new Date(input);

  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date input:', input);
    return null;
  }

  const date = dateObj.getDate();
  const year = dateObj.getFullYear();

  const month = dateObj.toLocaleString(locale, { month: 'short' }); // "Jun"
  const fullMonth = dateObj.toLocaleString(locale, { month: 'long' }); // "June"

  const day = dateObj.toLocaleString(locale, { weekday: 'long' }); // "Friday"
  const weekdayShort = dateObj.toLocaleString(locale, { weekday: 'short' }); // "Fri"

  const formatted = `${weekdayShort}, ${date} ${fullMonth} ${year}`;

  return {
    date,
    month,
    fullMonth,
    year,
    day,
    weekdayShort,
    formatted,
    iso: dateObj.toISOString(),
    localeString: dateObj.toLocaleString(locale),
  };
}
