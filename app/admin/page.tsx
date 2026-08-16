import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'
import { noIndexRobots } from '@/lib/page-metadata'

export const metadata: Metadata = {
  title: '관리자',
  robots: noIndexRobots,
}

export default function AdminPage() {
  return <AdminShell />
}
