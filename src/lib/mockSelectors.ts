import {
  badges,
  campusRoutes,
  chatRooms,
  currentUserId,
  identities,
  messages,
  partnerPosts,
  profiles,
  relationshipPreferences,
  reports,
  scoreLogs,
  trustProfiles,
  userBadges
} from "@/data/mock"
import { recommendFriends, recommendPartnerPosts, recommendRelationships, recommendRoutes } from "@/lib/matching/matchingEngine"
import { calculateCompanionScore } from "@/lib/trust/trustEngine"

export function getCurrentProfile() {
  const profile = profiles.find((item) => item.userId === currentUserId)
  if (!profile) throw new Error("Missing current user profile")
  return profile
}

export function getCurrentIdentity() {
  const identity = identities.find((item) => item.id === currentUserId)
  if (!identity) throw new Error("Missing current identity")
  return identity
}

export function getDashboardData() {
  const profile = getCurrentProfile()
  const identity = getCurrentIdentity()
  const partnerRecommendations = recommendPartnerPosts(profile, partnerPosts, trustProfiles)
  const routeRecommendations = recommendRoutes(profile, campusRoutes)
  const companion = calculateCompanionScore(currentUserId, scoreLogs)
  const ownedBadges = userBadges
    .filter((item) => item.userId === currentUserId)
    .map((item) => badges.find((badge) => badge.id === item.badgeId))
    .filter(Boolean)

  return {
    profile,
    identity,
    learningPartner: partnerRecommendations.find((item) => item.item.type.includes("学习") || item.item.type.includes("图书馆")),
    activityPartner: partnerRecommendations.find((item) => item.item.type.includes("展览") || item.item.type.includes("讲座")),
    route: routeRecommendations[0],
    pendingActivities: partnerPosts.filter((post) => post.currentParticipants.includes(currentUserId)),
    companion,
    recentBadges: ownedBadges.slice(0, 3)
  }
}

export function getRelationshipRecommendations() {
  const profile = getCurrentProfile()
  const preference = relationshipPreferences.find((item) => item.userId === currentUserId)
  if (!preference) return []
  return recommendRelationships(profile, preference, profiles, relationshipPreferences, trustProfiles)
}

export function getFriendRecommendations() {
  return recommendFriends(getCurrentProfile(), profiles, trustProfiles).slice(0, 6)
}

export function getPartnerRecommendations() {
  return recommendPartnerPosts(getCurrentProfile(), partnerPosts, trustProfiles)
}

export function getAdminDashboard() {
  return {
    newUsersToday: 4,
    partnerPostsToday: partnerPosts.filter((post) => post.createdAt.slice(0, 10) === "2026-06-06").length,
    routeCheckinsToday: 28,
    pendingReports: reports.filter((report) => report.status === "pending").length,
    pendingRoutes: campusRoutes.filter((route) => route.status === "community_pending").length,
    limitedUsers: trustProfiles.filter((profile) => profile.status !== "normal").length
  }
}

export function getChatRoomsForCurrentUser() {
  return chatRooms.filter((room) => room.participantIds.includes(currentUserId))
}

export function getRoomMessages(roomId: string) {
  return messages.filter((message) => message.roomId === roomId)
}
