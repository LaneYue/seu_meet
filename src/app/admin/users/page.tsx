import { BadgePill, Card, PageHeader } from "@/components/ui"
import { MockActionButton } from "@/components/MockActionButton"
import { profiles, trustProfiles } from "@/data/mock"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="User Risk" title="用户风控与封禁管理" description="信用状态只给管理端使用，不对普通用户做公开排名。" />
      <div className="space-y-3">
        {trustProfiles.map((trust) => {
          const profile = profiles.find((item) => item.userId === trust.userId)
          return (
            <Card key={trust.userId} className="shadow-none">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-ink">{profile?.nickname}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <BadgePill>{profile?.campus}</BadgePill>
                    <BadgePill>{profile?.departmentCategory}</BadgePill>
                    <BadgePill tone={trust.status === "normal" ? "green" : "red"}>{trust.status}</BadgePill>
                    <BadgePill>信任分 {trust.trustScore}</BadgePill>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <MockActionButton label="限制" doneLabel="已限制" />
                  <MockActionButton label="冻结" doneLabel="已冻结" />
                  <MockActionButton label="封禁" doneLabel="已封禁" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
