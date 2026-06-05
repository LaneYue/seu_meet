import { LogIn } from "lucide-react"
import { BadgePill, Card, PageHeader } from "@/components/ui"
import { MockActionButton } from "@/components/MockActionButton"
import { identities } from "@/data/mock"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mock Auth"
        title="校内统一身份认证模拟登录"
        description="MVP 不接入真实统一身份认证，也不要求填写身份证号。真实姓名和学号只作为 mock 身份源，不会在普通页面展示。"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {identities.slice(0, 6).map((identity) => (
          <Card key={identity.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{identity.campus}身份</h2>
                <p className="mt-1 text-sm text-slate-500">{identity.schoolOrDepartment}</p>
              </div>
              <LogIn className="size-5 text-campus" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <BadgePill tone="green">东南大学</BadgePill>
              <BadgePill>{identity.gradeRange}</BadgePill>
              <BadgePill>{identity.campus}</BadgePill>
            </div>
            <div className="mt-5">
              <MockActionButton label="使用该身份登录" doneLabel="已进入首页" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
