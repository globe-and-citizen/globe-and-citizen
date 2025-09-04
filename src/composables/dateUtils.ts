interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export function formatMonthYear(date: string): string {
  const [year, month] = date.split("-");
  // Change 'short' to 'long'
  const monthName = new Date(
    Number(year),
    Number(month) - 1
  ).toLocaleDateString("en-US", {
    month: "long",
  });
  // August 2030
  return `${monthName} ${year}`;
}

export function formatPublicationDate(date: string): string {
  const [year, month, day] = date.split("-");

  const monthName = new Date(
    Number(year),
    Number(month) - 1
  ).toLocaleDateString("en-US", {
    month: "long",
  });
  // August 2030
  return `${monthName.slice(0, 3)} ${day}, ${year}`;
}

export function monthDay(date: string): string {
  const seconds = date.split("T")[1];
  const dateObj = new Date(Number(seconds) * 1000);
  // Dec 10
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function shortMonthDayTime(timestamp?: Timestamp): string {
  const date = timestamp
    ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
    : new Date();
  // Dec 10 - 14:18
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    })
    .split(", ")
    .join(" - ");
}

export function dayMonthYear(timestamp?: Timestamp): string {
  const date = timestamp
    ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
    : new Date();
  // 10 Dec, 2022
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function monthDayYear(timestamp?: Timestamp): string {
  const date = timestamp
    ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
    : new Date();
  // 12/10/2022
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}
export function currentYearMonth(): string {
  // 2022-11
  return new Date()
    .toLocaleDateString("en-US", { year: "numeric", month: "2-digit" })
    .split("/")
    .reverse()
    .join("-");
}

export function previousYearMonth(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  // 2022-10
  return date
    .toLocaleDateString("en-US", { year: "numeric", month: "2-digit" })
    .split("/")
    .reverse()
    .join("-");
}

export function calculateEndDate(
  publishDate: string,
  duration: number
): string {
  const publishDayObj = new Date(publishDate);
  const endDate = new Date(
    publishDayObj.getTime() + duration * 24 * 60 * 60 * 1000
  );
  return endDate.toISOString().slice(0, 10).replace(/-/g, "/");
}

export function getCurrentDate(): string {
  const currentDate = new Date();
  let month: string | number = currentDate.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  let day: string | number = currentDate.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  return `${currentDate.getFullYear()}/${month}/${day}`;
}

export function computedDuration(endDate: string): number {
  const date1 = new Date();
  const date2 = new Date(endDate);
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  const Difference_In_Time = date2.getTime() - date1.getTime();
  return Math.round(Difference_In_Time / (1000 * 3600 * 24));
}

export function formatDate(inputDate: string): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [year, month, day] = inputDate.split("-");
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]}, ${year}`;
}
