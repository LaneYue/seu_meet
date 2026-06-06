import { Navigate, Route, Routes } from "react-router-dom"
import { PhoneFrame } from "./components/AppShell"
import { AchievementWallPage } from "./pages/AchievementWallPage"
import { ChatDetailPage } from "./pages/ChatDetailPage"
import { DiscoverSwipePage } from "./pages/DiscoverSwipePage"
import { IcebreakAnswerPage } from "./pages/IcebreakAnswerPage"
import { IcebreakResultPage } from "./pages/IcebreakResultPage"
import { MessagesPage } from "./pages/MessagesPage"
import { MyProfileEditPage } from "./pages/MyProfileEditPage"
import { MyProfilePage } from "./pages/MyProfilePage"
import { PartnerPostPage } from "./pages/PartnerPostPage"
import { PartnerSquarePage } from "./pages/PartnerSquarePage"
import { PointsPage } from "./pages/PointsPage"
import { ProfileDetailPage } from "./pages/ProfileDetailPage"
import { RedeemPage } from "./pages/RedeemPage"
import { RouteDetailPage } from "./pages/RouteDetailPage"
import { RoutePublishPage } from "./pages/RoutePublishPage"
import { RoutesPage } from "./pages/RoutesPage"
import { SwipePage } from "./pages/SwipePage"
import {
  BadgeApplyPage,
  BadgeWallPage,
  ChatBlockPage,
  ChatConfirmActivityPage,
  ChatEndPage,
  ChatReportPage,
  NotificationsPage,
  RouteCheckInPage,
  RouteInvitePage,
  SafetyCenterPage
} from "./pages/UtilityPages"

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<DiscoverSwipePage />} />
        <Route path="/home/profile/:profileId" element={<ProfileDetailPage />} />
        <Route path="/me" element={<MyProfilePage />} />
        <Route path="/me/edit" element={<MyProfileEditPage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/partners" element={<PartnerSquarePage />} />
        <Route path="/partners/new" element={<PartnerPostPage />} />
        <Route path="/partners/:category" element={<PartnerSquarePage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/routes/publish" element={<RoutePublishPage />} />
        <Route path="/routes/:routeId" element={<RouteDetailPage />} />
        <Route path="/routes/:routeId/checkin" element={<RouteCheckInPage />} />
        <Route path="/routes/:routeId/invite" element={<RouteInvitePage />} />
        <Route path="/badges" element={<BadgeWallPage />} />
        <Route path="/badges/apply" element={<BadgeApplyPage />} />
        <Route path="/achievements" element={<AchievementWallPage />} />
        <Route path="/achievements/:code/redeem" element={<RedeemPage />} />
        <Route path="/points" element={<PointsPage />} />
        <Route path="/safety" element={<SafetyCenterPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/chats" element={<MessagesPage />} />
        <Route path="/chats/category/:category" element={<MessagesPage />} />
        <Route path="/chats/:chatId" element={<ChatDetailPage />} />
        <Route path="/chats/:chatId/confirm-activity" element={<ChatConfirmActivityPage />} />
        <Route path="/chats/:chatId/report" element={<ChatReportPage />} />
        <Route path="/chats/:chatId/block" element={<ChatBlockPage />} />
        <Route path="/chats/:chatId/end" element={<ChatEndPage />} />
        <Route path="/icebreak/:matchId" element={<IcebreakAnswerPage />} />
        <Route path="/icebreak/:matchId/result" element={<IcebreakResultPage />} />
      </Routes>
    </PhoneFrame>
  )
}