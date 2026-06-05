import assert from "node:assert/strict"
import { badges, campusRoutes, currentUserId, partnerPosts, profiles, relationshipPreferences, reports, scoreLogs, trustProfiles, userBadges } from "../src/data/mock"
import { unlockBadgesAfterRoute } from "../src/lib/badges/badgeEngine"
import { recommendFriends, recommendPartnerPosts, recommendRelationships } from "../src/lib/matching/matchingEngine"
import { toPublicProfile } from "../src/lib/privacy"
import { applyNoShow, applyValidReport, calculateCompanionScore } from "../src/lib/trust/trustEngine"

const currentUser = profiles.find((profile) => profile.userId === currentUserId)
assert(currentUser, "current user exists")

const friendRecommendations = recommendFriends(currentUser, profiles, trustProfiles)
assert(friendRecommendations.length > 0, "friend recommendations exist")
assert(friendRecommendations[0].reasons.length > 0, "matching returns reasons")

const partnerRecommendations = recommendPartnerPosts(currentUser, partnerPosts, trustProfiles)
assert(partnerRecommendations[0].reasons.some((reason) => reason.includes("校区") || reason.includes("时间")), "partner matching considers time/campus/goal")

const relationshipPreference = relationshipPreferences.find((preference) => preference.userId === currentUserId)
assert(relationshipPreference, "relationship preference exists")
const relationshipRecommendations = recommendRelationships(currentUser, relationshipPreference, profiles, relationshipPreferences, trustProfiles)
assert(relationshipRecommendations.length <= 3, "relationship recommendations are capped at 3")

const route = campusRoutes.find((item) => item.id === "r01")
assert(route, "route exists")
const checkins = route.stops.map((stop) => ({
  id: `verify-${stop.id}`,
  routeId: route.id,
  userId: currentUserId,
  stopId: stop.id,
  status: "completed" as const,
  proofType: "manual" as const,
  createdAt: "2026-06-06T12:00:00.000+08:00"
}))
const unlocked = unlockBadgesAfterRoute(currentUserId, route, checkins, badges, userBadges.filter((badge) => badge.badgeId !== "b02"))
assert(unlocked.some((badge) => badge.id === "b02"), "route completion unlocks badge")

const companion = calculateCompanionScore(currentUserId, scoreLogs)
assert(companion.cappedTotal <= companion.total, "companion score can increase but has daily cap")
assert(companion.today <= companion.dailyCap, "daily companion score is capped")

const trust = trustProfiles.find((profile) => profile.userId === currentUserId)
assert(trust, "trust profile exists")
assert(applyNoShow(trust).trustScore < trust.trustScore, "no-show lowers trust score")
assert(["limited", "frozen"].includes(applyValidReport({ ...trust, trustScore: 55 }).status), "valid report changes user risk status")

const publicProfile = toPublicProfile(currentUser)
assert(!("realName" in publicProfile), "public profile has no real name")
assert(!("studentId" in publicProfile), "public profile has no student id")
assert(!("idCard" in publicProfile), "public profile has no identity card")

assert(relationshipRecommendations.every((item) => item.reasons.join("").includes("不进入公开榜单")), "relationship channel is not leaderboard-oriented")
assert(reports.some((report) => report.status === "pending"), "admin can process pending reports")

console.log("verify passed: 东大同行 MVP core rules are satisfied")
