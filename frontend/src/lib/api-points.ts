import { http } from "./http"

export type Transaction = {
  id: string
  desc: string
  amount: number
  date: string
}

export const pointsApi = {
  async getBalance(): Promise<number> {
    const data = await http.get<{ balance: number }>("/points/balance")
    return data.balance
  },

  async checkin(): Promise<{ amount: number; balance: number }> {
    const data = await http.post<{ amount: number; balance: number }>("/points/checkin")
    return data
  },

  async getTransactions(): Promise<Transaction[]> {
    const data = await http.get<{ list: { id: string; desc?: string; amount: number; createdAt: string }[] }>("/points/transactions")
    return data.list.map((tx) => ({
      id: tx.id,
      desc: tx.desc ?? "积分变动",
      amount: tx.amount,
      date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }) : "",
    }))
  },
}
