export const IS_ADMIN = false;

export const CHALLENGE_START = "2026-06-16";
export const CHALLENGE_INITIAL = 500;

export function getDayNumber(dateStr: string): number {
  const start = new Date(CHALLENGE_START + "T12:00:00").getTime();
  const date = new Date(dateStr + "T12:00:00").getTime();
  return Math.floor((date - start) / (1000 * 60 * 60 * 24)) + 1;
}
