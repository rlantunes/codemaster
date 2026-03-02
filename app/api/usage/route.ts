import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  let { data: profile } = await db.from("profiles").select("*").eq("clerk_id", userId).single();

  if (!profile) {
    const { data } = await db.from("profiles").insert({ clerk_id: userId, plan: "free", messages_today: 0, last_reset: new Date().toISOString() }).select().single();
    profile = data;
  }

  const limit = profile.plan === "pro" ? 9999 : 10;
  const languages = profile.plan === "pro"
    ? ["python","javascript","java","cpp","rust","go","typescript","csharp"]
    : ["python","javascript"];

  return NextResponse.json({ plan: profile.plan, messages_today: profile.messages_today, remaining: Math.max(0, limit - profile.messages_today), languages });
}
