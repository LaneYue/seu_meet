import type {
  CampusRoute,
  PartnerPost,
  Recommendation,
  RelationshipPreference,
  TrustProfile,
  UserProfile
} from "@/types"

const clamp = (value: number) => Math.max(0, Math.min(100, value))

const shared = (a: string[], b: string[]) => a.filter((item) => b.includes(item))

const trustScoreFor = (userId: string, trustProfiles: TrustProfile[]) =>
  trustProfiles.find((profile) => profile.userId === userId)?.trustScore ?? 75

export function recommendFriends(
  currentUser: UserProfile,
  candidates: UserProfile[],
  trustProfiles: TrustProfile[]
): Recommendation<UserProfile>[] {
  return candidates
    .filter((candidate) => candidate.userId !== currentUser.userId)
    .map((candidate) => {
      const sharedInterests = shared(currentUser.interests, candidate.interests)
      const sharedInterestScore = Math.min(sharedInterests.length * 22, 100)
      const campusCompatibilityScore = currentUser.campus === candidate.campus ? 100 : 72
      const activityTimeScore = shared(currentUser.socialGoals, candidate.socialGoals).length > 0 ? 86 : 56
      const crossDepartmentBonus =
        currentUser.departmentCategory !== candidate.departmentCategory ? 100 : 54
      const trustScore = trustScoreFor(candidate.userId, trustProfiles)

      const score = clamp(
        sharedInterestScore * 0.35 +
          campusCompatibilityScore * 0.2 +
          activityTimeScore * 0.15 +
          crossDepartmentBonus * 0.15 +
          trustScore * 0.15
      )
      const reasons = [
        sharedInterests.length
          ? `你们都关注 ${sharedInterests.slice(0, 2).join("、")}`
          : "你们的兴趣互补，适合跨圈层交流",
        currentUser.campus === candidate.campus
          ? `你们都在${currentUser.campus}校区，公共空间见面更方便`
          : `跨校区交流可从校园路线或公共活动开始`,
        currentUser.departmentCategory !== candidate.departmentCategory
          ? `你来自${currentUser.departmentCategory}，对方来自${candidate.departmentCategory}，适合跨专业交流`
          : "你们有相近学院背景，学习节奏更容易对齐",
        `对方信用状态稳定，当前信任分 ${trustScore}`
      ]

      return { item: candidate, score: Math.round(score), reasons }
    })
    .sort((a, b) => b.score - a.score)
}

export function recommendPartnerPosts(
  currentUser: UserProfile,
  posts: PartnerPost[],
  trustProfiles: TrustProfile[]
): Recommendation<PartnerPost>[] {
  return posts
    .filter((post) => post.status === "open")
    .map((post) => {
      const sameGoalScore = currentUser.socialGoals.some((goal) => post.type.includes(goal.replace("搭子", "")))
        ? 100
        : currentUser.interests.some((interest) => post.description.includes(interest))
          ? 78
          : 58
      const hoursUntilStart =
        (new Date(post.startTime).getTime() - new Date("2026-06-06T09:00:00+08:00").getTime()) /
        36e5
      const timeOverlapScore = hoursUntilStart >= 0 && hoursUntilStart <= 72 ? 92 : 66
      const campusDistanceScore =
        post.campus === "不限" ? 86 : post.campus === currentUser.campus ? 100 : 62
      const requirementFitScore = post.requirements?.some((requirement) => requirement.includes("守时"))
        ? 90
        : 78
      const trustScore = trustScoreFor(post.authorId, trustProfiles)

      const score = clamp(
        sameGoalScore * 0.3 +
          timeOverlapScore * 0.25 +
          campusDistanceScore * 0.2 +
          requirementFitScore * 0.15 +
          trustScore * 0.1
      )
      const reasons = [
        `活动类型是${post.type}，与你当前目标接近`,
        post.campus === currentUser.campus
          ? `活动在${currentUser.campus}校区，通勤成本低`
          : post.campus === "不限"
            ? "活动不限校区，可灵活约在公共空间"
            : `跨校区活动建议选择明确公共集合点`,
        `时间在未来 ${Math.max(1, Math.round(hoursUntilStart))} 小时内，适合近期安排`,
        `发起者信用状态稳定，当前信任分 ${trustScore}`
      ]

      return { item: post, score: Math.round(score), reasons }
    })
    .sort((a, b) => b.score - a.score)
}

export function recommendRelationships(
  currentUser: UserProfile,
  currentPreference: RelationshipPreference,
  candidates: UserProfile[],
  preferences: RelationshipPreference[],
  trustProfiles: TrustProfile[]
): Recommendation<UserProfile>[] {
  if (!currentPreference.enabled) return []

  return candidates
    .filter((candidate) => candidate.userId !== currentUser.userId)
    .filter((candidate) => preferences.some((preference) => preference.userId === candidate.userId && preference.enabled))
    .map((candidate) => {
      const candidatePreference = preferences.find((preference) => preference.userId === candidate.userId)
      const sharedInterests = shared(currentUser.interests, candidate.interests)
      const relationshipGoalFit =
        candidatePreference?.relationshipGoal === currentPreference.relationshipGoal ? 100 : 72
      const communicationStyleFit = shared(
        currentPreference.communicationStyle,
        candidatePreference?.communicationStyle ?? []
      ).length
        ? 94
        : 64
      const activityPreferenceFit = shared(
        currentPreference.activityPreference,
        candidatePreference?.activityPreference ?? []
      ).length
        ? 92
        : 62
      const campusCompatibilityScore = currentPreference.preferredCampuses.includes(candidate.campus)
        ? 92
        : 60
      const sharedInterestScore = Math.min(sharedInterests.length * 25, 100)
      const trustScore = trustScoreFor(candidate.userId, trustProfiles)
      const score = clamp(
        relationshipGoalFit * 0.25 +
          communicationStyleFit * 0.2 +
          activityPreferenceFit * 0.2 +
          campusCompatibilityScore * 0.15 +
          sharedInterestScore * 0.1 +
          trustScore * 0.1
      )

      return {
        item: candidate,
        score: Math.round(score),
        reasons: [
          "双方都主动开启了认真关系意向频道",
          candidatePreference?.relationshipGoal === currentPreference.relationshipGoal
            ? `你们都选择了「${currentPreference.relationshipGoal}」`
            : "关系节奏不完全相同，建议从低频公共活动开始",
          sharedInterests.length
            ? `共同兴趣包括 ${sharedInterests.slice(0, 2).join("、")}`
            : "兴趣信息较少，建议先用破冰问题了解彼此",
          "该频道不进入公开榜单，也不产生官方奖励"
        ]
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, currentPreference.dailyRecommendationLimit)
}

export function recommendRoutes(currentUser: UserProfile, routes: CampusRoute[]): Recommendation<CampusRoute>[] {
  return routes
    .filter((route) => route.status === "official" || route.status === "community_approved")
    .map((route) => {
      const campusScore = route.campus === currentUser.campus ? 100 : 70
      const goalScore = route.suitableGoals.some((goal) => currentUser.socialGoals.includes(goal)) ? 100 : 65
      const interestScore = currentUser.interests.some((interest) => route.description.includes(interest)) ? 84 : 62
      const score = clamp(campusScore * 0.4 + goalScore * 0.4 + interestScore * 0.2)
      return {
        item: route,
        score: Math.round(score),
        reasons: [
          route.campus === currentUser.campus
            ? `路线位于${route.campus}校区，适合今天直接开始`
            : "跨校区路线适合周末或搭配公共交通同行",
          `路线目标覆盖 ${route.suitableGoals.slice(0, 2).join("、")}`
        ]
      }
    })
    .sort((a, b) => b.score - a.score)
}
