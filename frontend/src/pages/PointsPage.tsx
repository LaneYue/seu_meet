import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle2, Coins } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { pointsApi, type Transaction } from "../lib/api-points"

const EARN_WAYS = [
  { label: "每日签到", points: "+5" },
  { label: "完成路线节点打卡", points: "+2/节点" },
  { label: "发布路线被购买", points: "+购买价格" },
  { label: "破冰问答参与", points: "+3" },
  { label: "完成整条路线", points: "+10" },
]

const RECHARGE_PLANS = [
  { points: 50, price: 5 },
  { points: 150, price: 12 },
  { points: 500, price: 35 },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", desc: "每日签到", amount: 5, date: "今天" },
  { id: "2", desc: "购买路线：九龙湖学习搭子路线", amount: -20, date: "昨天" },
  { id: "3", desc: "路线打卡奖励", amount: 2, date: "昨天" },
  { id: "4", desc: "发布路线奖励", amount: 3, date: "3天前" },
]

export function PointsPage() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(130)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [checkedIn, setCheckedIn] = useState(false)
  const [rechargeMsg, setRechargeMsg] = useState("")

  useEffect(() => {
    pointsApi.getBalance().then(setBalance).catch(() => {})
    pointsApi.getTransactions().then((list) => { if (list.length > 0) setTransactions(list) }).catch(() => {})
  }, [])

  const handleCheckin = async () => {
    if (checkedIn) return
    try {
      const result = await pointsApi.checkin()
      setBalance(result.balance)
    } catch {
      setBalance((b) => b + 5) // 后端不可达时本地加
    }
    setCheckedIn(true)
  }

  const handleRecharge = (points: number) => {
    setRechargeMsg(`充值功能即将上线，敬请期待～（将获得 ${points} 点数）`)
    setTimeout(() => setRechargeMsg(""), 2500)
  }

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page points-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>我的点数</h1>
            <p>完成活动积攒，或付费充值</p>
          </div>
        </header>

        <section className="points-balance-card">
          <Coins size={32} />
          <div>
            <strong>{balance}</strong>
            <span>当前点数</span>
          </div>
        </section>

        <section className="glass-card points-earn-section">
          <h2>获取点数</h2>
          {EARN_WAYS.map((way, i) => (
            <div className="points-earn-row" key={i}>
              <CheckCircle2 size={16} className={i === 0 && checkedIn ? "done" : "pending"} />
              <span>{way.label}</span>
              <b>{way.points}</b>
              {i === 0 && (
                <button className={`checkin-btn ${checkedIn ? "done" : ""}`} onClick={handleCheckin}>
                  {checkedIn ? "已签到" : "签到"}
                </button>
              )}
            </div>
          ))}
        </section>

        <section className="glass-card points-recharge-section">
          <h2>付费充值</h2>
          <p className="points-recharge-hint">充值功能即将上线</p>
          <div className="recharge-grid">
            {RECHARGE_PLANS.map((plan) => (
              <button key={plan.points} className="recharge-card" onClick={() => handleRecharge(plan.points)}>
                <Coins size={18} />
                <strong>{plan.points} 点</strong>
                <span>¥{plan.price}</span>
              </button>
            ))}
          </div>
          {rechargeMsg && <p className="recharge-toast">{rechargeMsg}</p>}
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>近期流水</h2></div>
          {transactions.map((tx) => (
            <div className="points-tx-row" key={tx.id}>
              <div>
                <span>{tx.desc}</span>
                <small>{tx.date}</small>
              </div>
              <b className={tx.amount > 0 ? "positive" : "negative"}>
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
              </b>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
