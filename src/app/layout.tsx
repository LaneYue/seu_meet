import type { Metadata } from "next"
import "./globals.css"
import { AppShell } from "@/components/AppShell"

export const metadata: Metadata = {
  title: "东大同行",
  description: "东南大学校内可信社交与共同行动平台 MVP"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
