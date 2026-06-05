import { notFound } from "next/navigation"
import { Flag, ShieldX, UserMinus } from "lucide-react"
import { BadgePill, Card, GhostButton, PageHeader, SafetyNotice } from "@/components/ui"
import { MockActionButton } from "@/components/MockActionButton"
import { chatRooms, currentUserId, profiles } from "@/data/mock"
import { getRoomMessages } from "@/lib/mockSelectors"

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const room = chatRooms.find((item) => item.id === params.id)
  if (!room) notFound()
  const messages = getRoomMessages(room.id)
  const other = profiles.find((profile) => profile.userId === room.participantIds.find((id) => id !== currentUserId))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Matched Chat"
        title={`与 ${other?.nickname ?? "同学"} 的安全聊天`}
        description="MVP 使用本地状态展示，不接入 WebSocket。内容会经过关键词 mock 审核。"
      />
      <SafetyNotice />
      <Card>
        <div className="flex flex-wrap gap-2">
          <BadgePill tone="green">双向匹配</BadgePill>
          <BadgePill>{room.matchType}</BadgePill>
          <BadgePill>破冰问题：今天最想完成的一件小事是什么？</BadgePill>
        </div>
        <div className="mt-5 space-y-3">
          {messages.map((message) => {
            const mine = message.senderId === currentUserId
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-6 ${mine ? "bg-campus text-white" : "bg-slate-100 text-slate-700"}`}>
                  {message.content}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input className="focus-ring min-h-10 rounded-md border border-slate-200 px-3 py-2" placeholder="输入 mock 消息" />
          <MockActionButton label="发送" doneLabel="已发送" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <GhostButton><Flag className="mr-2 size-4" />举报</GhostButton>
          <GhostButton><ShieldX className="mr-2 size-4" />拉黑</GhostButton>
          <GhostButton><UserMinus className="mr-2 size-4" />取消匹配</GhostButton>
        </div>
      </Card>
    </div>
  )
}
