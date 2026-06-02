import { NextRequest, NextResponse } from 'next/server'
import { hasAdminSession, isAdminConfigured } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: hasAdminSession(request),
    configured: isAdminConfigured(),
  })
}
