import { NextResponse } from "next/server"

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init)
}

export function created<T>(data: T) {
  return ok(data, { status: 201 })
}

export function mockMutation(action: string, payload?: unknown) {
  return ok({
    action,
    accepted: true,
    payload,
    auditTrailId: `audit-${Date.now()}`,
    message: "MVP mock mutation recorded"
  })
}
