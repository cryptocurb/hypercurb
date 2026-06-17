import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = ["/", "/perps", "/etf"];
  for (const p of paths) {
    revalidatePath(p);
  }

  return NextResponse.json({
    revalidated: paths,
    timestamp: new Date().toISOString(),
  });
}
