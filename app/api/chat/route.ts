import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLANS: Record<string, { messagesPerDay: number; languages: string[] }> = {
  free: { messagesPerDay: 10, languages: ["python", "javascript"] },
  pro: { messagesPerDay: 999999, languages: ["python","javascript","java","cpp","rust","go","typescript","csharp"] },
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  let { data: profile } = await db.from("profiles").select("*").eq("clerk_id", userId).single();
  if (!profile) {
    const { data } = await db.from("profiles").insert({ clerk_id: userId, plan: "free", messages_today: 0, last_reset: new Date().toISOString() }).select().single();
    profile = data;
  }

  if (new Date(profile.last_reset).toDateString() !== new Date().toDateString()) {
    await db.from("profiles").update({ messages_today: 0, last_reset: new Date().toISOString() }).eq("clerk_id", userId);
    profile.messages_today = 0;
  }

  const plan = profile.plan as string;
  if (profile.messages_today >= PLANS[plan].messagesPerDay) {
    return NextResponse.json({ error: "limite_atingido", message: "Limite de mensagens atingido! Faça upgrade para Pro 🚀", plan }, { status: 429 });
  }

  const { messages, language, level, topic } = await req.json();

  if (!PLANS[plan].languages.includes(language)) {
    return NextResponse.json({ error: "linguagem_bloqueada", message: `${language} é exclusivo do plano Pro! 🔓`, plan }, { status: 403 });
  }

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1024, system: `Você é CodeMaster, tutor de ${language} nível ${level} sobre "${topic}". Responda em Português do Brasil, use blocos de código, seja didático e encorajador.`, messages }),
  });

  if (!r.ok) return NextResponse.json({ error: "Erro na IA" }, { status: 500 });
  const data = await r.json();
  const reply = data.content?.map((b: { text?: string }) => b.text || "").join("") || "Erro.";

  await db.from("profiles").update({ messages_today: profile.messages_today + 1 }).eq("clerk_id", userId);

  return NextResponse.json({ reply, remaining: plan === "free" ? PLANS.free.messagesPerDay - (profile.messages_today + 1) : 9999, plan });
}
