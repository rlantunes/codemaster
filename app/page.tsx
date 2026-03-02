"use client";
import { useRouter } from "next/navigation";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <div style={{ background: "#0A0A0F", color: "#E6EDF3", minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .btn-primary { background: linear-gradient(135deg, #6366F1, #A78BFA); border: none; color: #fff; padding: 16px 36px; border-radius: 14px; font-size: 17px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.25s ease; }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(99,102,241,0.5); }
        .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #E6EDF3; padding: 10px 24px; border-radius: 10px; font-size: 15px; cursor: pointer; font-family: inherit; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; }
      `}</style>

      <nav style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", zIndex: 100 }}>
        <div style={{ fontWeight: 900, fontSize: 22, background: "linear-gradient(135deg, #6366F1, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚡ CodeMaster</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {isSignedIn ? (
            <button className="btn-primary" style={{ padding: "10px 24px", fontSize: 15 }} onClick={() => router.push("/dashboard")}>Abrir App →</button>
          ) : (
            <>
              <SignInButton mode="modal"><button className="btn-ghost">Entrar</button></SignInButton>
              <SignUpButton mode="modal"><button className="btn-primary" style={{ padding: "10px 24px", fontSize: 15 }}>Começar Grátis</button></SignUpButton>
            </>
          )}
        </div>
      </nav>

      <section style={{ textAlign: "center", padding: "100px 20px 80px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 50, padding: "8px 20px", marginBottom: 32, fontSize: 13, color: "#A78BFA", fontWeight: 600 }}>
          ✨ Gratuito para começar — Sem cartão de crédito
        </div>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, margin: "0 0 24px", lineHeight: 1.05, letterSpacing: -2 }}>
          Aprenda a programar<br />
          <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #A78BFA 50%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>com um tutor de IA</span>
        </h1>
        <p style={{ color: "#8B949E", fontSize: 20, maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.6 }}>
          Explicações claras, exemplos reais e exercícios práticos em Python, JavaScript, Java e muito mais — tudo em Português.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {isSignedIn ? (
            <button className="btn-primary" onClick={() => router.push("/dashboard")}>🚀 Abrir Meu Painel</button>
          ) : (
            <SignUpButton mode="modal"><button className="btn-primary">🚀 Começar Grátis Agora</button></SignUpButton>
          )}
        </div>
        <p style={{ color: "#484F58", fontSize: 13, marginTop: 24 }}>10 mensagens/dia grátis · Sem cartão · Cancele quando quiser</p>
      </section>

      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 38, fontWeight: 800, marginBottom: 60, letterSpacing: -1 }}>Tudo que você precisa para aprender</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {[
            { icon: "🤖", title: "IA Personalizada", desc: "Tutor que adapta as explicações ao seu nível e ritmo" },
            { icon: "💻", title: "8 Linguagens", desc: "Python, JS, Java, C++, Rust, Go, TypeScript e C#" },
            { icon: "📝", title: "Exemplos Práticos", desc: "Código real com explicação linha por linha" },
            { icon: "🏋️", title: "Exercícios", desc: "Desafios práticos para fixar o aprendizado" },
            { icon: "🔥", title: "3 Níveis", desc: "Do iniciante absoluto ao avançado" },
            { icon: "🇧🇷", title: "100% em Português", desc: "Aprenda na sua língua materna" },
          ].map(f => (
            <div key={f.title} className="card">
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ margin: 0, color: "#8B949E", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ padding: "80px 40px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 38, fontWeight: 800, marginBottom: 60, letterSpacing: -1 }}>Preço simples e justo</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "2px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px" }}>
            <div style={{ color: "#8B949E", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>GRÁTIS</div>
            <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 8 }}>R$0<span style={{ fontSize: 18, color: "#8B949E", fontWeight: 400 }}>/mês</span></div>
            <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 40px", display: "flex", flexDirection: "column", gap: 14 }}>
              {["10 mensagens por dia", "Python e JavaScript", "Todos os níveis", "Todos os tópicos"].map(item => (
                <li key={item} style={{ display: "flex", gap: 10, color: "#C9D1D9" }}><span style={{ color: "#10B981" }}>✓</span> {item}</li>
              ))}
            </ul>
            <SignUpButton mode="modal">
              <button style={{ width: "100%", padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#E6EDF3", borderRadius: 14, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>Começar Grátis</button>
            </SignUpButton>
          </div>
          <div style={{ background: "rgba(99,102,241,0.08)", border: "2px solid #6366F1", borderRadius: 24, padding: "40px 36px" }}>
            <div style={{ color: "#A78BFA", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>PRO</div>
            <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 8 }}>R$29<span style={{ fontSize: 18, color: "#8B949E", fontWeight: 400 }}>/mês</span></div>
            <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 40px", display: "flex", flexDirection: "column", gap: 14 }}>
              {["Mensagens ilimitadas", "8 linguagens (todas)", "Todos os níveis e tópicos", "Suporte prioritário"].map(item => (
                <li key={item} style={{ display: "flex", gap: 10, color: "#C9D1D9" }}><span style={{ color: "#A78BFA" }}>✓</span> {item}</li>
              ))}
            </ul>
            <button className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 16 }} onClick={() => router.push("/dashboard")}>Assinar Pro →</button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#484F58", fontSize: 14, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontWeight: 700, color: "#8B949E" }}>⚡ CodeMaster</div>
        <div>© {new Date().getFullYear()} CodeMaster. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
