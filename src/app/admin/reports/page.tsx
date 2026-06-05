import { BadgePill, Card, PageHeader } from "@/components/ui"
import { MockActionButton } from "@/components/MockActionButton"
import { profiles, reports } from "@/data/mock"

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reports" title="举报处理" description="管理员操作需要留痕，处理结果会影响信用状态但不产生公开排名。" />
      <div className="space-y-4">
        {reports.map((report) => {
          const reporter = profiles.find((profile) => profile.userId === report.reporterId)
          return (
            <Card key={report.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <BadgePill tone="red">{report.category}</BadgePill>
                    <BadgePill>{report.status}</BadgePill>
                    <BadgePill>举报人：{reporter?.nickname}</BadgePill>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{report.description}</p>
                  <p className="mt-2 text-xs text-slate-500">创建时间：{report.createdAt}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <MockActionButton label="认定成立" doneLabel="已处理" />
                  <MockActionButton label="驳回" doneLabel="已驳回" />
                  <MockActionButton label="限制用户" doneLabel="已限制" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
