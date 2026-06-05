export function moderateMessage(content: string): "clean" | "flagged" | "blocked" {
  const blocked = ["身份证", "宿舍楼", "私密地点", "侮辱", "威胁"]
  const flagged = ["加微信", "手机号", "单独出去", "酒店", "刷分", "骂"]

  if (blocked.some((word) => content.includes(word))) return "blocked"
  if (flagged.some((word) => content.includes(word))) return "flagged"
  return "clean"
}
