import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the name of the given objectInfo, using the following
 * order of preference:
 *
 * 1. `name`
 * 2. `Name`
 * 3. `MethodName`
 * 4. `DeveloperName`
 * 5. `MasterLabel`
 * 6. `ValidationName`
 * 7. `EntityDefinition.MasterLabel`
 * 8. `NamespacePrefix`
 *
 * If none of the above are present, an empty string is returned.
 * @param {object} objectInfo - The objectInfo from Salesforce
 * @returns {string} - The name of the object
 */
export function getObjectName(objectInfo: any): string {
  return (
    objectInfo.name ||
    objectInfo.Name ||
    objectInfo.MethodName ||
    objectInfo.DeveloperName ||
    objectInfo.MasterLabel ||
    objectInfo.ValidationName ||
    objectInfo["EntityDefinition.MasterLabel"] ||
    objectInfo.NamespacePrefix
  );
}

/**
 * Converts a datetime string in the format YYYY-MM-DDTHH:mm:ss.SSSZ
 * to a string in the format Month Day, Year.
 * @param str - The datetime string to convert.
 * @returns The formatted datetime string.
 */
export function convertToDatetimeAndFormat(str: string): string {
  // Parse the string assuming format YYYY-MM-DDTHH:mm:ss.SSSZ
  const parts = str.split("T");
  const datePart = parts[0];
  const timePart = parts[1].split(".")[0]; // Remove milliseconds

  // Create a new Date object
  const date = new Date(datePart + "T" + timePart + "Z");

  // Use Intl.DateTimeFormat for Month, Day Year formatting
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return formatter.format(date);
}

/**
 * Format a timestamp string into a human-readable datetime string.
 *
 * The input string should be in the format `YYYYMMDDHHMMSS` and is expected
 * to be in the UTC timezone. The output string will be in the format
 * `YYYY-MM-DD HH:MM:SS`.
 *
 * @param {string} timestamp The input timestamp string.
 * @returns {string} The formatted datetime string.
 */
export function formatDateTimeFromTimeStamp(timestamp: string): string {
  const dt = timestamp.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/)!;
  return `${dt[1]}-${dt[2]}-${dt[3]} ${dt[4]}:${dt[5]}:${dt[6]}`;
}

function msToHHMMSS(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

/**
 * Returns true if the application is running in a development environment.
 * This is determined by either being in development mode or if the URL
 * contains ".development." or "localhost".
 * @returns {boolean} True if the application is running in a development environment.
 */
export function isDevelopment(): boolean {
  const fullUrl: string =
    typeof window !== "undefined" ? window.location.href : "";
  return (
    process.env.NODE_ENV === "development" ||
    fullUrl.includes("development.") ||
    fullUrl.includes("dev.") ||
    fullUrl.includes("localhost")
  );
}
