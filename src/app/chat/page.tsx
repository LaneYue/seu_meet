import { MessageSquare } from "lucide-react"
import { ActionLink, BadgePill, Card, PageHeader, SafetyNotice } from "@/components/ui"
import { currentUserId, profiles } from "@/data/mock"
import { getChatRoomsForCurrentUser } from "@/lib/mockSelectors"

export default function ChatPage() {
  const rooms = getChatRoomsForCurrentUser()
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Safe Chat"
        title="匹配后的聊天"
        description="只有双向匹配后才能开启聊天。每个房间都支持举报、拉黑和取消匹配。"
      />
      <SafetyNotice />
      <div className="grid gap-4 md:grid-cols-2">
        {rooms.map((room) => {
          const otherId = room.participantIds.find((id) => id !== currentUserId)
          const other = profiles.find((profile) => profile.userId === otherId)
          return (
            <Card key={room.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{other?.nickname}</h2>
                  <p className="mt-1 text-sm text-slate-500">双向匹配 · {room.matchType}</p>
                </div>
                <MessageSquare className="size-5 text-campus" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <BadgePill tone="green">{room.status}</BadgePill>
                <BadgePill>可举报</BadgePill>
                <BadgePill>可拉黑</BadgePill>
              </div>
              <div className="mt-5">
                <ActionLink href={`/chat/${room.id}`}>进入聊天</ActionLink>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
