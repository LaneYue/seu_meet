import { Eye, EyeOff } from "lucide-react"
import { BadgePill, Card, PageHeader } from "@/components/ui"
import { getCurrentProfile } from "@/lib/mockSelectors"

export default function ProfilePage() {
  const profile = getCurrentProfile()
  const visibility = [
    ["显示校区", profile.visibility.showCampus],
    ["显示学院大类", profile.visibility.showDepartmentCategory],
    ["显示年级区间", profile.visibility.showGradeRange],
    ["显示兴趣标签", profile.visibility.showInterests]
  ] as const

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile & Privacy"
        title="我的资料与隐私设置"
        description="资料页只维护昵称、校区、学院大类、年级区间、兴趣和社交目标，不保存身份证号，也不向普通用户展示真实姓名和学号。"
      />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-semibold text-ink">{profile.nickname}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{profile.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <BadgePill tone="green">{profile.campus}</BadgePill>
            <BadgePill>{profile.departmentCategory}</BadgePill>
            <BadgePill>{profile.gradeRange}</BadgePill>
          </div>
          <h3 className="mt-6 font-semibold text-ink">兴趣标签</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <BadgePill key={interest} tone="blue">
                {interest}
              </BadgePill>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-ink">隐私可见性</h2>
          <div className="mt-4 space-y-3">
            {visibility.map(([label, enabled]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <span className="font-medium text-slate-700">{label}</span>
                <span className={`inline-flex items-center gap-2 text-sm ${enabled ? "text-campus" : "text-slate-500"}`}>
                  {enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  {enabled ? "公开" : "隐藏"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-lg bg-mist p-4 text-sm leading-6 text-slate-700">
            隐私策略：平台推荐可以使用校内认证结果，但普通用户侧默认只展示昵称和用户主动公开的信息。
          </p>
        </Card>
      </div>
    </div>
  )
}
