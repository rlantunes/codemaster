"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍", color: "#3B82F6", free: true },
  { id: "javascript", name: "JavaScript", icon: "⚡", color: "#F59E0B", free: true },
  { id: "java", name: "Java", icon: "☕", color: "#EF4444", free: false },
  { id: "cpp", name: "C++", icon: "⚙️", color: "#8B5CF6", free: false },
  { id: "rust", name: "Rust", icon: "🦀", color: "#F97316", free: false },
  { id: "go", name: "Go", icon: "🐹", color: "#10B981", free: false },
  { id: "typescript", name: "TypeScript", icon: "📘", color: "#2563EB", free: false },
  { id: "csharp", name: "C#", icon: "💜", color: "#7C3AED", free: false },
];

const LEVELS = [
  { id: "Iniciante", name: "Iniciante", icon: "🌱" },
  { id: "Intermediário", name: "Intermediário", icon: "🔥" },
  { id: "Avançado", name: "Avançado", icon: "🚀" },
];

const TOPICS = [
  "Variáveis e Tipos","Condicionais","Loops","Funções","Arrays/Listas",
  "Orientação a Objetos","Tratamento de Erros","Arquivos I/O",
  "APIs e HTTP","Banco de Dados","Algoritmos","Estruturas de Dados",
];

type Lang = typeof LANGUAGES[0];
type Level = typeof LEVELS[0];
type Message = { role: string; content: string };
type Usage = { plan: string; remaining: number };

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<"setup"|"chat">("setup");
  const [selectedLang, setSelectedLang] = useState<Lang|null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level|null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string|null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<Usage|null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadUsage = useCallback(async () => {
    const res = await fetch("/api/usage");
    if (res.ok) { const d = await res.json(); setUsage({ plan: d.plan, remaining: d.remaining }); }
  }, []);

  useEffect(() => {
    loadUsage();
    if (searchParams.get("upgraded") === "true") alert("🎉 Bem-vindo ao Pro! Aproveite mensagens ilimitadas!");
  }, [loadUsage, searchParams]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startLesson = async () => {
    if (!selectedLang || !selectedLevel || !selectedTopic) return;
    setScreen("chat"); setLoading(true);
    const initMsgs = [{ role: "user", content: `Quero aprender sobre "${selectedTopic}" em ${selectedLang.name}. Meu nível é ${selectedLevel.name}.` }];
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: initMsgs, language: selectedLang.id, level: selectedLevel.name, topic: selectedTopic }) });
    const data = await res.json();
    if (!res.ok) { if (data.error === "limite_atingido" || data.error === "linguagem_bloqueada") setShowUpgrade(true); setScreen("setup"); setLoading(false); return; }
    setMessages([{ role: "assistant", content: data.reply }]);
    if (data.remaining !== undefined) setUsage(prev => prev ? { ...prev, remaining: data.remaining } : null);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs, language: selectedLang?.id, level: selectedLevel?.name, topic: selectedTopic }) });
    const data = await res.json();
    if (!res.ok) { if (data.error === "limite_atingido") setShowUpgrade(true); setMessages([...newMsgs, { role: "assistant", content: data.message || "❌ Erro." }]); }
    else { setMessages([...newMsgs, { role: "assistant", content: data.reply }]); if (data.remaining !== undefined) setUsage(prev => prev ? { ...prev, remaining: data.remaining } : null); }
    setLoading(false);
  };

  const upgradeNow = async () => {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) router.push(data.url);
  };

  const formatMessage = (text: string) => {
    const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const lines = part.split("\n");
        const lang = lines[0].replace("```", "");
        const code = lines.slice(1, -1).join("\n");
        return (
          <div key={i} style={{ background: "#0D1117", border: "1px solid #30363D", borderRadius: 10, margin: "12px 0", overflow: "hidden" }}>
            <div style={{ background: "#161B22", padding: "6px 14px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #30363D" }}>
              <span style={{ color: "#8B949E", fontSize: 12, fontFamily: "monospace" }}>{lang || "code"}</span>
              <button onClick={() => navigator.clipboard?.writeText(code)} style={{ background: "none", border: "1px solid #30363D", color: "#8B949E", padding: "2px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>📋 Copiar</button>
            </div>
            <pre style={{ margin: 0, padding: 16, color: "#E6EDF3", fontSize: 13, fontFamily: "'Fira Code', monospace", overflowX: "auto", lineHeight: 1.6 }}><code>{code}</code></pre>
          </div>
        );
      }
      return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
    });
  };

  const UpgradeModal = () => !showUpgrade ? null : (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: "#161B22", border: "1px solid #30363D", borderRadius: 24, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
        <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 800 }}>Faça Upgrade para Pro</h2>
        <p style={{ color: "#8B949E", marginBottom: 32, lineHeight: 1.6 }}>Mensagens ilimitadas e acesso a todas as 8 linguagens!</p>
        <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: 20, marginBottom: 32 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#A78BFA" }}>R$29<span style={{ fontSize: 16, color: "#8B949E", fontWeight: 400 }}>/mês</span></div>
        </div>
        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          <button onClick={upgradeNow} style={{ background: "linear-gradient(135deg, #6366F1, #A78BFA)", border: "none", color: "#fff", padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>⚡ Assinar Pro Agora</button>
          <button onClick={() => setShowUpgrade(false)} style={{ background: "none", border: "1px solid #30363D", color: "#8B949E", padding: 12, borderRadius: 14, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Continuar Grátis</button>
        </div>
      </div>
    </div>
  );

  if (screen === "setup") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#E6EDF3", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`* { box-sizing: border-box; } .c:hover { transform: translateY(-4px); } .c { transition: all 0.25s ease; cursor: pointer; } .p:hover { transform: scale(1.05); } .p { transition: all 0.2s ease; cursor: pointer; }`}</style>
      <UpgradeModal />
      <div style={{ padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.4)" }}>
        <div style={{ fontWeight: 900, fontSize: 20, background: "linear-gradient(135deg, #6366F1, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚡ CodeMaster</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {usage && (
            <div style={{ background: usage.plan === "pro" ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)", border: `1px solid ${usage.plan === "pro" ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.3)"}`, borderRadius: 20, padding: "6px 14px", fontSize: 13 }}>
              {usage.plan === "pro" ? <span style={{ color: "#10B981" }}>✨ Pro — Ilimitado</span> : <span style={{ color: "#A78BFA" }}>💬 {usage.remaining} msgs restantes hoje</span>}
            </div>
          )}
          {usage?.plan !== "pro" && <button onClick={() => setShowUpgrade(true)} style={{ background: "linear-gradient(135deg, #6366F1, #A78BFA)", border: "none", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>⚡ Upgrade Pro</button>}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 12px" }}>Olá, {user?.firstName || "estudante"}! 👋</h1>
          <p style={{ color: "#8B949E", fontSize: 18 }}>O que você quer aprender hoje?</p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #A78BFA)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>1</span> Escolha a Linguagem
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {LANGUAGES.map(l => {
              const locked = !l.free && usage?.plan !== "pro";
              return (
                <div key={l.id} className="c" onClick={() => locked ? setShowUpgrade(true) : setSelectedLang(l)} style={{ padding: "18px 20px", borderRadius: 16, background: selectedLang?.id === l.id ? `${l.color}22` : "rgba(255,255,255,0.03)", border: `2px solid ${selectedLang?.id === l.id ? l.color : "rgba(255,255,255,0.06)"}`, opacity: locked ? 0.6 : 1, position: "relative" }}>
                  {locked && <div style={{ position: "absolute", top: 8, right: 8, fontSize: 12 }}>🔒</div>}
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{l.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                  {!l.free && <div style={{ fontSize: 10, color: "#6366F1", marginTop: 2, fontWeight: 600 }}>PRO</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", background: selectedLang ? "linear-gradient(135deg, #6366F1, #A78BFA)" : "#1C2128", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: selectedLang ? "#fff" : "#444" }}>2</span> Seu Nível
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, opacity: selectedLang ? 1 : 0.4, pointerEvents: selectedLang ? "auto" : "none" }}>
            {LEVELS.map(lv => (
              <div key={lv.id} className="c" onClick={() => setSelectedLevel(lv)} style={{ padding: 20, borderRadius: 16, textAlign: "center", background: selectedLevel?.id === lv.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)", border: `2px solid ${selectedLevel?.id === lv.id ? "#6366F1" : "rgba(255,255,255,0.06)"}` }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{lv.icon}</div>
                <div style={{ fontWeight: 700 }}>{lv.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", background: selectedLevel ? "linear-gradient(135deg, #6366F1, #A78BFA)" : "#1C2128", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: selectedLevel ? "#fff" : "#444" }}>3</span> Tópico
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, opacity: selectedLevel ? 1 : 0.4, pointerEvents: selectedLevel ? "auto" : "none" }}>
            {TOPICS.map(t => (
              <div key={t} className="p" onClick={() => setSelectedTopic(t)} style={{ padding: "10px 18px", borderRadius: 50, background: selectedTopic === t ? `${selectedLang?.color || "#6366F1"}33` : "rgba(255,255,255,0.05)", border: `1px solid ${selectedTopic === t ? (selectedLang?.color || "#6366F1") : "rgba(255,255,255,0.08)"}`, fontSize: 14, fontWeight: selectedTopic === t ? 600 : 400, color: selectedTopic === t ? "#fff" : "#8B949E" }}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={startLesson} disabled={!selectedLang || !selectedLevel || !selectedTopic} style={{ padding: "18px 48px", borderRadius: 16, background: selectedLang && selectedLevel && selectedTopic ? "linear-gradient(135deg, #6366F1, #A78BFA)" : "#1C2128", border: "none", color: selectedLang && selectedLevel && selectedTopic ? "#fff" : "#555", fontSize: 17, fontWeight: 700, cursor: selectedLang && selectedLevel && selectedTopic ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
            {selectedLang && selectedLevel && selectedTopic ? `🚀 Começar Aula de ${selectedLang.name}` : "Complete os passos acima"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0D1117", color: "#E6EDF3", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #30363D; border-radius: 3px; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} } .q:hover { background: rgba(99,102,241,0.2) !important; } .q { transition: all 0.2s; }`}</style>
      <UpgradeModal />
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #21262D", background: "#161B22", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={() => { setScreen("setup"); setMessages([]); }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #30363D", borderRadius: 10, padding: "8px 14px", color: "#8B949E", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Voltar</button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${selectedLang?.color || "#6366F1"}, #A78BFA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{selectedLang?.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>CodeMaster · {selectedLang?.name}</div>
            <div style={{ color: "#8B949E", fontSize: 12 }}>{selectedLevel?.icon} {selectedLevel?.name} · 📚 {selectedTopic}</div>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {messages.length === 0 && loading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ width: 40, height: 40, border: "3px solid #6366F1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#8B949E" }}>Preparando sua aula...</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 24, display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 12, animation: "fadeIn 0.3s ease" }}>
              {msg.role === "assistant" && <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${selectedLang?.color || "#6366F1"}, #A78BFA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{selectedLang?.icon}</div>}
              <div style={{ maxWidth: "80%", padding: "14px 18px", borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px", background: msg.role === "user" ? "linear-gradient(135deg, #6366F1, #7C3AED)" : "#161B22", border: msg.role === "user" ? "none" : "1px solid #21262D", fontSize: 14, lineHeight: 1.7 }}>
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}
          {loading && messages.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${selectedLang?.color || "#6366F1"}, #A78BFA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{selectedLang?.icon}</div>
              <div style={{ padding: "14px 20px", borderRadius: "4px 18px 18px 18px", background: "#161B22", border: "1px solid #21262D", display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", animation: `spin 1s ease ${j*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{ padding: "8px 20px 0", borderTop: "1px solid #21262D", background: "#0D1117" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          {["Explique de novo 🔄","Outro exemplo 📝","Me dê um exercício 💪","Uso na prática? 🌍","Próximo passo? ➡️"].map(q => (
            <button key={q} className="q" onClick={() => setInput(q)} style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#A78BFA", fontSize: 12, whiteSpace: "nowrap", cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px 20px", background: "#0D1117", flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1, background: "#161B22", border: "1px solid #30363D", borderRadius: 16, padding: "12px 16px" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Pergunte qualquer coisa... (Enter para enviar)" style={{ width: "100%", background: "none", border: "none", outline: "none", color: "#E6EDF3", fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120 }} rows={1} />
          </div>
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ width: 48, height: 48, borderRadius: 14, background: loading || !input.trim() ? "#1C2128" : "#6366F1", border: "none", color: loading || !input.trim() ? "#555" : "#fff", fontSize: 20, cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loading ? <span style={{ width: 18, height: 18, border: "2px solid #555", borderTopColor: "#999", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> : "↑"}
          </button>
        </div>
      </div>
    </div>
  );
}
