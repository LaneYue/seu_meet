import { Send } from "lucide-react"
import { BadgePill, Card, PageHeader } from "@/components/ui"

const partnerTypes = ["学习搭子", "图书馆搭子", "饭搭子", "运动搭子", "讲座搭子", "展览搭子", "跨校区同行", "竞赛组队", "项目开发"]

export default function NewPartnerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New Partner Post"
        title="发布搭子需求"
        description="发布信息默认面向校内用户，避免暴露真实身份、宿舍楼栋和实时位置。"
      />
      <Card>
        <form className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            标题
            <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" defaultValue="今晚图书馆自习搭子" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            校区
            <select className="focus-ring rounded-md border border-slate-200 px-3 py-2" defaultValue="九龙湖">
              <option>九龙湖</option>
              <option>四牌楼</option>
              <option>丁家桥</option>
              <option>不限</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            类型
            <select className="focus-ring rounded-md border border-slate-200 px-3 py-2" defaultValue="学习搭子">
              {partnerTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            最大人数
            <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" type="number" min={2} max={8} defaultValue={4} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            描述
            <textarea className="focus-ring min-h-28 rounded-md border border-slate-200 px-3 py-2" defaultValue="19:00 到 22:00，互相提醒专注，结束后各自复盘 3 行。" />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <BadgePill tone="green">公共场所</BadgePill>
            <BadgePill>不显示实时定位</BadgePill>
            <BadgePill>可举报/拉黑</BadgePill>
          </div>
          <button type="button" className="focus-ring inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-campus px-4 py-2 text-sm font-semibold text-white">
            <Send className="size-4" />
            发布 mock 需求
          </button>
        </form>
      </Card>
    </div>
  )
}
