import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'repause_admin_session'
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12

interface AdminAccount {
  adminId: string
  password: string
}

interface AdminConfig {
  accounts: AdminAccount[]
  secret: string
}

function getAdminConfig(): AdminConfig | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim()
  if (!secret) return null

  const accounts: AdminAccount[] = []

  const primaryId = process.env.ADMIN_ID?.trim()
  const primaryPassword = process.env.ADMIN_PASSWORD?.trim()
  if (primaryId && primaryPassword) {
    accounts.push({ adminId: primaryId, password: primaryPassword })
  }

  const testId = process.env.ADMIN_TEST_ID?.trim()
  const testPassword = process.env.ADMIN_TEST_PASSWORD?.trim()
  if (testId && testPassword) {
    accounts.push({ adminId: testId, password: testPassword })
  }

  if (accounts.length === 0) return null

  return { accounts, secret }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function sign(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function createSessionToken(adminId: string, secret: string) {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000
  const payload = `${adminId}:${expiresAt}`
  const signature = sign(payload, secret)

  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

function verifySessionToken(token: string, config: AdminConfig) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const parts = decoded.split(':')

    if (parts.length !== 3) {
      return false
    }

    const [adminId, expiresAtText, signature] = parts
    const expiresAt = Number(expiresAtText)
    const knownIds = config.accounts.map((account) => account.adminId)

    if (!knownIds.some((id) => safeEqual(adminId, id))) {
      return false
    }

    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      return false
    }

    const expectedSignature = sign(`${adminId}:${expiresAtText}`, config.secret)
    return safeEqual(signature, expectedSignature)
  } catch {
    return false
  }
}

export function isAdminConfigured() {
  return getAdminConfig() !== null
}

/** 일치하면 해당 adminId, 아니면 null */
export function validateAdminCredentials(adminId: string, password: string): string | null {
  const config = getAdminConfig()

  if (!config) {
    return null
  }

  for (const account of config.accounts) {
    if (safeEqual(adminId, account.adminId) && safeEqual(password, account.password)) {
      return account.adminId
    }
  }

  return null
}

export function hasAdminSession(request: NextRequest) {
  const config = getAdminConfig()
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  if (!config || !token) {
    return false
  }

  return verifySessionToken(token, config)
}

export function setAdminSession(response: NextResponse, adminId: string) {
  const config = getAdminConfig()

  if (!config) {
    throw new Error('관리자 계정이 설정되지 않았습니다.')
  }

  if (!config.accounts.some((account) => safeEqual(account.adminId, adminId))) {
    throw new Error('유효하지 않은 관리자 계정입니다.')
  }

  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(adminId, config.secret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  })
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export function requireAdmin(request: NextRequest) {
  if (hasAdminSession(request)) {
    return null
  }

  return NextResponse.json(
    { error: '관리자 로그인이 필요합니다.' },
    { status: 401 }
  )
}
