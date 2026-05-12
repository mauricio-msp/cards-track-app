export function resolveTargetPeriod(
  dueDay: number,
  month?: number,
  year?: number,
): { targetMonth: number; targetYear: number } {
  const now = new Date()
  let targetMonth = month ?? (now.getDate() > dueDay ? now.getMonth() + 1 : now.getMonth())
  let targetYear = year ?? now.getFullYear()

  if (month === undefined && targetMonth > 11) {
    targetMonth = 0
    targetYear++
  }

  return { targetMonth, targetYear }
}
