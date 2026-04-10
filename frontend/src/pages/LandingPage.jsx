// LandingPage.jsx

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";





/* ─── tiny helpers ─────────────────────────────────── */
const Ticker = ({ items }) => (
  <div className="overflow-hidden whitespace-nowrap border-y border-white/10 py-3 my-0 bg-white/[0.02]">
    <motion.div
      className="inline-flex gap-16"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
    >
      {[...items, ...items].map((t, i) => (
        <span key={i} className="text-white/25 text-[11px] tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Space Mono', monospace" }}>
          {t}
        </span>
      ))}
    </motion.div>
  </div>
);

const GlitchChar = ({ char, delay = 0 }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 4000 + Math.random() * 6000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={`inline-block transition-transform ${glitch ? "translate-y-[-3px] text-[--blueshade]" : ""}`}
      style={{ transitionDuration: "80ms" }}>
      {char}
    </span>
  );
};

/* ─── main ────────────────────────────────────────── */
export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const heading = "GROUNDED";

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        .grid-bg {
          background-image:
            linear-gradient(rgba(198,241,53,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(198,241,53,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .float-anim  { animation: float-slow 7s ease-in-out infinite; }
        .spin-slow   { animation: spin-slow 18s linear infinite; }
        .hover-lift  { transition: transform 0.4s cubic-bezier(.23,1,.32,1); }
        .hover-lift:hover { transform: translateY(-6px); }
      `}</style>

      <div ref={containerRef}
        className="relative min-h-screen overflow-hidden grid-bg"
        style={{ background: "#0a0d06", color: "#f0ede4" }}>

        {/* ── Ambient blobs ───────────────────────── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, --blueshade 0%, transparent 70%)", top: "-200px", left: "-200px" }} />
          <div className="absolute w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, --blueshade 0%, transparent 70%)", top: "-200px", left: "-200px" }} />

          <div className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, #64ffb40d 0%, transparent 70%)", bottom: "0px", right: "10%" }} />
        </div>

        {/* ── Decorative scattered elements ───────── */}
        <div className="pointer-events-none absolute inset-0">
          {/* spinning ring top-right */}
          <div className="absolute top-24 right-16 w-32 h-32 spin-slow opacity-20"
            style={{ border: "1px solid var(--blueshade)", borderRadius: "50%" }} />
          <div className="absolute top-24 right-16 w-24 h-24 m-4"

            style={{ border: "1px dashed var(--blueshade)", borderRadius: "50%" }}
          />

          {/* doc lines — decorative */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute h-px"
              style={{
                width: `${60 + i * 20}px`, background: "rgba(240,237,228,0.08)",
                left: `${8 + i * 3}%`, top: `${38 + i * 4}%`
              }} />
          ))}

          {/* floating tag badges */}
          <motion.div className="absolute top-[22%] left-[6%] float-anim"
            style={{ animationDelay: "0s" }}>
            <div className="text-[10px] px-3 py-1 border border-white/10 text-[--golden] tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace", background: "rgba(198,241,53,0.04)" }}>
              RAG
            </div>
          </motion.div>
          <motion.div className="absolute top-[40%] right-[7%] float-anim"
            style={{ animationDelay: "2s" }}>
            <div className="text-[10px] px-3 py-1 border border-white/10 
            text-[var(--golden)] tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              ✦ Multi-agent Routing
            </div>
          </motion.div>
          <motion.div className="absolute bottom-[30%] left-[2%] float-anim"
            style={{ animationDelay: "3.5s" }}>
            <div className="text-[10px] px-3 py-1 border border-white/10 
            text-[var(--golden)] tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              SEMANTIC SEARCH
            </div>
          </motion.div>

          {/* corner cross ornaments */}
          {[["top-[15%]", "left-[22%]"], ["top-[55%]", "right-[20%]"], ["bottom-[20%]", "left-[35%]"]].map(([t, l], i) => (
            <div key={i} className={`absolute ${t} ${l} text-white/10 text-2xl select-none`}
              style={{ fontFamily: "serif" }}>✦</div>
          ))}

          {/* vertical rule */}
          <div className="absolute left-[50%] top-[8%] h-24 w-px"

            style={{ background: "linear-gradient(to bottom, transparent, rgba(var(--blueshade-rgb),1.1), transparent)" }} />

        </div>

        {/* ── NAV ─────────────────────────────────── */}
        <Header />

        {/* ── TICKER ──────────────────────────────── */}
        <Ticker items={[
          "Retrieval-based generation",
          "Context-aware responses",
          "Source-backed answers",
          "Hallucination detection",
          "LangGraph orchestration"
        ]} />

        {/* ── HERO ────────────────────────────────── */}
        <section className="relative z-10 px-10 pt-20 pb-12 max-w-7xl mx-auto">

          {/* issue number — editorial label */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            className="flex items-center gap-4 mb-10">
            <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Vol. 01 — Document Intelligence
            </span>
            {/* <div className="h-px flex-1 max-w-[80px]" style={{ background: "rgba(198,241,53,0.3)" }} /> */}

            <div className="h-px flex-1 max-w-[80px]" style={{ background: "rgba(var(--blueshade-rgb),0.3)" }} />
          </motion.div>

          {/* MAIN HEADLINE — collage typography */}
          <div className="relative">
            {/* "Turn your" — small, serif italic */}
            <motion.p
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-white/40 text-xl md:text-2xl mb-2 ml-1"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>
              {/* Turn your documents into */}
              Understand what your documents actually say
            </motion.p>

            {/* "GROUNDED" — massive Bebas display */}
            <motion.h1
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="leading-none tracking-tight select-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 14vw, 200px)", color: "#f0ede4", lineHeight: 0.9 }}>
              {heading.split("").map((c, i) => (
                <GlitchChar key={i} char={c} delay={i * 0.1} />
              ))}
            </motion.h1>

            {/* "conversations" — serif, colored */}
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-end gap-4 mt-1 flex-wrap">
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "clamp(60px, 10vw, 140px)", color: "var(--blueshade)", lineHeight: 0.9 }}>
                Answers
              </span>



              <span className="hidden md:block mb-3 text-[var(--golden)] text-sm tracking-[0.2em] uppercase pb-4"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                — backed by you data
              </span>
            </motion.div>
          </div>

          {/* body copy + CTA row */}
          <div className="mt-14 flex flex-col md:flex-row md:items-end gap-10 md:gap-20">
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="max-w-md text-white/50 leading-relaxed"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "18px", fontStyle: "italic" }}>
              Your documents are parsed, embedded, and retrieved using vector search.
              Answers are generated through a routed pipeline with memory and evaluation —
              so every response is grounded, traceable, and scored for reliability.
            </motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }} className="flex flex-col items-start gap-4">
              <Link to="/app">
                <button className="group relative overflow-hidden px-10 py-4 bg-[--blueshade] 
                hover:bg-[--lighter-blueshade]
                transition-colors duration-200">
                  <span className="text-[var(--golden)] text-sm tracking-widest uppercase font-bold flex items-center gap-3"
                    style={{ fontFamily: "'Space Mono', monospace" }}>
                    Analyze Documents
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                  </span>
                </button>
              </Link>

              <span className="text-white/20 text-[10px] tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                {" "}
              </span>

              <div className="flex gap-3 mt-3 flex-wrap">
                {["RAG", "LangGraph", "Vector Search", "Memory", "Evaluation"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-3 py-1 border border-white/10 text-white/30 tracking-widest"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── DIVIDER w/ stat strip ───────────────── */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="origin-left border-t border-white/5 mx-10 mt-4" />

        <div className="grid grid-cols-3 border-b border-white/5 mx-10">
          {[["Source-backed", "answers"], ["Context-aware", "responses"], ["Evaluation-enabled", "outputs"]].map(([num, label], i) => (
            // {[["10x", "faster answers"], ["100%", "source-backed"], ["< 1s", "retrieval time"]].map(([num, label], i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className={`py-6 px-4 ${i < 2 ? "border-r border-white/5" : ""}`}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", color: "var(--blueshade)", lineHeight: 1 }}>{num}</p>
              <p className="text-white/30 text-[10px] tracking-widest uppercase mt-1"
                style={{ fontFamily: "'Space Mono', monospace" }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── FEATURES ────────────────────────────── */}
        <section className="relative z-10 px-10 py-20 max-w-7xl mx-auto">

          {/* section label */}
          <div className="flex items-center gap-4 mb-14">
            <div className="w-6 h-px bg-[--blueshade]/60" />
            <span className="text-[--blueshade]/60 text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Core Capabilities
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-white/5">
            {[
              {
                num: "01",
                title: "Grounded\nAnswers",
                desc: "Responses are generated strictly from retrieved document context. If the information is not present, the system does not fabricate answers.",
                tag: "RAG",
              },
              {
                num: "02",
                title: "Retrieval\nTransparency",
                desc: "Every response includes the exact text chunks used. No black-box answers — you see what the model sees.",
                tag: "CITATIONS",
              },
              {
                num: "03",
                title: "Built-in\nEvaluation",
                desc: "Each response is scored for relevance, context usage, and hallucination risk. Confidence is visible, not assumed..",
                tag: "HALLUCINATION DETECTION",
              },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`hover-lift p-8 ${i < 2 ? "border-r border-white/5" : ""} group cursor-default`}
                style={{ background: "rgba(255,255,255,0.01)" }}>
                {/* --stop */}
                <div className="flex justify-between items-start mb-8">
                  <span className="text-white/10 text-[10px] tracking-[0.3em]"
                    style={{ fontFamily: "'Space Mono', monospace" }}>{f.num}</span>
                  <span className="text-[rgba(var(--blueshade-rgb),0.7)] group-hover:text-[rgba(var(--blueshade-rgb),1.7)] transition-colors text-[9px] tracking-widest border border-[rgba(var(--blueshade-rgb),0.2)] group-hover:border-[rgba(var(--blueshade-rgb),5)] px-2 py-1"
                    style={{ fontFamily: "'Space Mono', monospace" }}>{f.tag}</span>
                </div>

                <h3 className="text-white/90 leading-none mb-5 whitespace-pre-line"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "0.02em" }}>
                  {f.title}
                </h3>

                <p className="text-white/35 text-sm leading-relaxed"
                  style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "15px" }}>
                  {f.desc}
                </p>

                <div className="mt-8 w-0 group-hover:w-full h-px bg-[rgba(var(--blueshade-rgb),4.0)] transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </section>



        {/* ── HOW IT WORKS ────────────────────────── */}
        <section className="relative z-10 px-10 pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-6 h-px bg-white/20" />
            <span className="text-white/30 text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              How it works
            </span>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              ["Upload", "Documents are parsed and split into semantic chunks."],
              ["Embed", "Chunks are converted into vectors and stored in Qdrant."],
              ["Retrieve", "Relevant context is fetched using vector similarity search."],
              ["Generate", "A routed pipeline combines context and memory to generate responses."],
              ["Evaluate", "Outputs are analyzed for accuracy and hallucination."],

            ].map(([step, desc], i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <div className="text-[--blueshade]/20 text-[10px] tracking-widest mb-3"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  0{i + 1} ——
                </div>
                <p className="text-white/80 text-xl mb-2"
                  style={{ fontFamily: "'Instrument Serif', serif" }}>{step}</p>
                <p className="text-white/30 text-xs leading-relaxed"
                  style={{ fontFamily: "'Space Mono', monospace", lineHeight: 1.8 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FULL-WIDTH CTA STRIP ─────────────────── */}
        <motion.section
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="relative z-10 border-t border-white/5 px-10 py-20 overflow-hidden">

          <div className="pointer-events-none absolute inset-0"
            // style={{ background: "radial-gradient(ellipse at center, rgba(198,241,53,0.05) 0%, transparent 70%)" }} />

            style={{ background: "radial-gradient(ellipse at center, rgba(var(--glow-blueshade)) 0%, transparent 70%)" }} />

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <p className="text-white/20 text-sm tracking-[0.2em] uppercase mb-3"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                Ready to start?
              </p>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 7vw, 96px)", color: "#f0ede4", lineHeight: 0.95 }}>
                Your documents,<br />
                <span style={{ color: "var(--blueshade)" }}>finally understood.</span>
              </h2>
            </div>

            <Link to="/app">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-12 py-5 bg-transparent border-2 border-[--blueshade]/60 hover:border-[--blueshade] hover:bg-[--blueshade]/5 transition-all duration-300">
                <span className="text-[--blueshade] text-sm tracking-widest uppercase"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  Open SmartNotes →
                </span>
              </motion.button>
            </Link>
          </div>
        </motion.section>

        {/* ── FOOTER ───────────────────────────────── */}
        <footer className="border-t border-white/5 px-10 py-8 flex items-center justify-between">
          <span className="text-white/15 text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            © 2025 SmartNotes
          </span>
          <span className="text-white/10 text-[10px] tracking-widest"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            Built on retrieval, memory, and evaluation
          </span>
        </footer>
      </div>
    </>
  );
}
