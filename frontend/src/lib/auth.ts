import { http } from "./http"

export type AuthUser = {
  id: string
  studentId: string
  nickname: string
  avatar: string | null
  college: string
  major: string
  grade: string
  campus: string
  gender: string
  bio: string | null
  tags: string[]
  creditScore: number
  points: number
  status: string
}

type AuthResponse = {
  user: AuthUser
  token: { accessToken: string; expiresIn: number }
}

export const auth = {
  async register(payload: {
    studentId: string
    realName: string
    idCardLast6: string
    password: string
    nickname: string
    college: string
    major: string
    grade: string
    campus: string
    gender: string
  }): Promise<AuthUser> {
    const data = await http.post<AuthResponse>("/auth/register", payload)
    localStorage.setItem("token", data.token.accessToken)
    return data.user
  },

  async login(studentId: string, password: string): Promise<AuthUser> {
    const data = await http.post<AuthResponse>("/auth/login", { studentId, password })
    localStorage.setItem("token", data.token.accessToken)
    return data.user
  },

  logout() {
    localStorage.removeItem("token")
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem("token")
  },
}
