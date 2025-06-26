export function extractDateParts(dateStr: string): {
  date: number;
  month: string;
  year: number;
  day: string;
} {
  const dateObj = new Date(dateStr);

  return {
    date: dateObj.getDate(),
    month: dateObj.toLocaleString('default', { month: 'short' }), // e.g., "Jun"
    year: dateObj.getFullYear(),
    day: dateObj.toLocaleString('default', { weekday: 'long' }), // e.g., "Thursday"
  };
}
