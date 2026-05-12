export type ChartDataRow = {
  cardName: string
  month: number
  total: number
}

export type CardAmountRow = {
  cardId: string
  cardName: string
  total: number
}

export interface IMetricsRepository {
  getTrend(userId: string, year: number): Promise<ChartDataRow[]>
  getYears(userId: string): Promise<number[]>
  getMonthCardAmounts(userId: string, month: number, year: number): Promise<CardAmountRow[]>
  getMonthTotalAmount(userId: string, month: number, year: number, today: number): Promise<number>
  getTotalAmount(userId: string): Promise<number>
}
