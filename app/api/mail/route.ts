import { NextRequest, NextResponse } from "next/server";
import { fetchInbox } from "@/lib/mailer";
import { requireAdmin } from "@/lib/admin-auth";

// GET /api/mail?limit=20
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");

  try {
    const mails = await fetchInbox(limit);
    return NextResponse.json(mails);
  } catch (error) {
    return NextResponse.json(
      { error: "메일 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
