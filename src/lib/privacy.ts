import type { PublicProfile, UserProfile } from "@/types"

export function toPublicProfile(profile: UserProfile): PublicProfile {
  return {
    id: profile.id,
    nickname: profile.nickname,
    avatarUrl: profile.avatarUrl,
    campus: profile.visibility.showCampus ? profile.campus : "九龙湖",
    departmentCategory: profile.visibility.showDepartmentCategory ? profile.departmentCategory : "人文",
    gradeRange: profile.visibility.showGradeRange ? profile.gradeRange : "本科高年级",
    bio: profile.bio,
    interests: profile.visibility.showInterests ? profile.interests : [],
    socialGoals: profile.socialGoals,
    visibility: profile.visibility
  }
}
