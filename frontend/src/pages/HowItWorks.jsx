// src/pages/HowItWorks.jsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";

/* ── shared font import (matches LandingPage) ── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
  .grid-bg {
    background-image:
      linear-gradient(rgba(198,241,53,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(198,241,53,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  @keyframes float-slow {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-12px); }
  }
  .float-anim { animation: float-slow 6s ease-in-out infinite; }
  @keyframes pulse-line {
    0%,100% { opacity: 0.15; }
    50%      { opacity: 0.6; }
  }
  .pulse-line { animation: pulse-line 2.5s ease-in-out infinite; }
  @keyframes dash-flow {
    to { stroke-dashoffset: -24; }
  }
  .dash-flow { animation: dash-flow 1.8s linear infinite; }
`;

/* ── Pipeline step data ── */
const PIPELINE = [
  {
    num: "01",
    label: "Upload",
    tag: "PDF → TEXT",
    color: "rgba(240,237,228,0.6)",
    desc: "PDF is parsed page-by-page. OCR fallback handles scanned documents. Text is cleaned and split into 500-char semantic chunks with 150-char overlap.",
    detail: ["PyPDF + Tesseract OCR", "RecursiveCharacterTextSplitter", "Min chunk length: 50 chars"],
  },
  {
    num: "02",
    label: "Embed",
    tag: "BGE-BASE-EN",
    color: "var(--blueshade)",
    desc: "Each chunk is prefixed with 'Represent this sentence:' and encoded by BGE-base-en-v1.5. Vectors are normalized and stored in Qdrant with doc_id payload.",
    detail: ["768-dim cosine vectors", "Batch upload with exponential backoff", "Payload indexed by doc_id"],
  },
  {
    num: "03",
    label: "Route",
    tag: "LANGGRAPH",
    color: "var(--blueshade)",
    desc: "Query is scored against the vector store. Score determines the agent path. Ambiguous scores trigger an LLM sanity check before committing.",
    detail: ["Score ≥ 0.70 → RAG", "Score 0.40–0.70 → LLM check", "Score < 0.40 → General"],
    highlight: true,
  },
  {
    num: "04",
    label: "Generate",
    tag: "GEMINI 2.5",
    color: "var(--blueshade)",
    desc: "The selected agent generates an answer. RAG uses retrieved chunks. Hybrid blends doc excerpts with general knowledge. General uses pure LLM knowledge.",
    detail: ["RAG agent + query expansion", "Hybrid agent for partial docs", "General agent for off-topic"],
  },
  {
    num: "05",
    label: "Evaluate",
    tag: "SELF-EVAL",
    color: "rgba(240,237,228,0.6)",
    desc: "A separate deterministic LLM scores the response for relevance, context usage, and hallucination risk. Results surface in the Insight Panel.",
    detail: ["Gemini 2.0 Flash (no thinking)", "Relevance + context + hallucination", "Scores shown in real-time UI"],
  },
];

/* ── Router zone explainer ── */
const ZONES = [
  { range: "≥ 0.70", label: "RAG", desc: "Strong vector match — full retrieval with query expansion", color: "var(--blueshade)" },
  { range: "0.40 – 0.70", label: "Hybrid / RAG", desc: "Ambiguous — LLM confirms if context answers the query", color: "rgba(240,237,228,0.5)" },
  { range: "< 0.40", label: "General", desc: "No document relevance — pure LLM knowledge used", color: "rgba(240,237,228,0.25)" },
];

/* ── Agent cards ── */
const AGENTS = [
  {
    name: "RAG Agent",
    tag: "HIGH CONFIDENCE",
    desc: "Retrieves top-k chunks via cosine similarity. Expands query into 3 phrasings to cover plurals and synonyms. De-duplicates across expansions.",
    traits: ["Query expansion ×3", "Chunk de-duplication", "Score threshold: 0.70"],
    color: "var(--blueshade)",
  },
  {
    name: "Hybrid Agent",
    tag: "PARTIAL MATCH",
    desc: "Blends document excerpts with general LLM knowledge. Clearly separates what came from the document vs. general knowledge in its response.",
    traits: ["Doc snippet + general KW", "Source attribution", "Best for thin docs"],
    color: "rgba(240,237,228,0.55)",
  },
  {
    name: "General Agent",
    tag: "OFF-TOPIC",
    desc: "Answers from pure LLM knowledge when no document relevance exists. Concise, bullet-pointed answers. Max 150 words to avoid bloat.",
    traits: ["No document context", "Concise format", "Grounded response"],
    color: "rgba(240,237,228,0.3)",
  },
];

/* ─────────────────────────────────────────────── */
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(null);
  const containerRef = useRef(null);

  return (
    <>
      <style>{FONTS}</style>

      <div
        ref={containerRef}
        className="relative min-h-screen overflow-hidden grid-bg"
        style={{ background: "#0a0d06", color: "#f0ede4" }}
      >
        {/* ambient blob */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(var(--blueshade-rgb),0.04) 0%, transparent 70%)", top: "-100px", right: "-100px" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(var(--blueshade-rgb),0.03) 0%, transparent 70%)", bottom: "100px", left: "-100px" }} />
        </div>

        {/* decorative crosses */}
        <div className="pointer-events-none absolute inset-0">
          {[["top-[12%]","left-[8%]"],["top-[45%]","right-[6%]"],["bottom-[25%]","left-[45%]"]].map(([t,l],i)=>(
            <div key={i} className={`absolute ${t} ${l} text-white/[0.06] text-3xl select-none`}>✦</div>
          ))}
        </div>

        <Header />

        {/* ── HERO ── */}
        <section className="relative z-10 px-10 pt-20 pb-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="w-6 h-px" style={{ background: "var(--blueshade)" }} />
            <span className="text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace", color: "var(--blueshade)" }}>
              System Architecture
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(64px,10vw,140px)", lineHeight: 0.92, color: "#f0ede4" }}
          >
            How it
            <br />
            <span style={{ color: "var(--blueshade)" }}>actually works</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-8 max-w-xl text-white/45 leading-relaxed"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "18px" }}
          >
            From a PDF upload to a scored, source-backed answer — every step in the
            SmartNotes pipeline is transparent, traceable, and built on LangGraph.
          </motion.p>
        </section>

        <div className="border-t border-white/5 mx-10" />

        {/* ── PIPELINE STEPS ── */}
        <section className="relative z-10 px-10 py-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-6 h-px bg-white/20" />
            <span className="text-white/30 text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              The pipeline — step by step
            </span>
          </div>

          <div className="relative">
            {/* vertical connector line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-px hidden md:block pulse-line"
              style={{ background: "linear-gradient(to bottom, transparent, var(--blueshade), transparent)" }} />

            <div className="space-y-0">
              {PIPELINE.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="relative flex gap-8 group cursor-pointer border-b border-white/[0.04] py-8"
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                  style={{ background: activeStep === i ? "rgba(255,255,255,0.015)" : "transparent" }}
                >
                  {/* step dot */}
                  <div className="flex-shrink-0 w-10 flex flex-col items-center pt-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full border transition-all duration-300 z-10"
                      style={{
                        borderColor: activeStep === i ? "var(--blueshade)" : "rgba(255,255,255,0.2)",
                        background: activeStep === i ? "var(--blueshade)" : "#0a0d06",
                        boxShadow: activeStep === i ? "0 0 8px var(--blueshade)" : "none",
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* row header */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-white/15 text-[10px] tracking-widest"
                        style={{ fontFamily: "'Space Mono', monospace" }}>{step.num}</span>
                      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color: step.color, lineHeight: 1, letterSpacing: "0.02em" }}>
                        {step.label}
                      </h3>
                      <span className="text-[9px] tracking-widest px-2 py-1 border"
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          borderColor: "rgba(255,255,255,0.08)",
                          color: "rgba(240,237,228,0.3)"
                        }}>
                        {step.tag}
                      </span>
                      {step.highlight && (
                        <span className="text-[9px] tracking-widest px-2 py-1 border"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            borderColor: "rgba(var(--blueshade-rgb),0.3)",
                            color: "var(--blueshade)"
                          }}>
                          ✦ LangGraph node
                        </span>
                      )}
                      <span className="ml-auto text-white/20 text-[10px] group-hover:text-white/40 transition-colors"
                        style={{ fontFamily: "'Space Mono', monospace" }}>
                        {activeStep === i ? "— collapse" : "+ expand"}
                      </span>
                    </div>

                    {/* description */}
                    <p className="mt-3 text-white/40 leading-relaxed max-w-2xl"
                      style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "16px" }}>
                      {step.desc}
                    </p>

                    {/* expanded detail */}
                    {activeStep === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 flex flex-wrap gap-3"
                      >
                        {step.detail.map((d, j) => (
                          <span key={j}
                            className="text-[10px] px-3 py-1.5 border tracking-wider"
                            style={{
                              fontFamily: "'Space Mono', monospace",
                              borderColor: "rgba(var(--blueshade-rgb),0.25)",
                              color: "var(--blueshade)",
                              background: "rgba(var(--blueshade-rgb),0.04)"
                            }}>
                            {d}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROUTER SCORE ZONES ── */}
        <section className="relative z-10 px-10 pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-6 h-px" style={{ background: "var(--blueshade)", opacity: 0.5 }} />
            <span className="text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace", color: "rgba(var(--blueshade-rgb),0.6)" }}>
              Router — score zones
            </span>
          </div>

          {/* score bar visual */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="origin-left mb-3 h-1 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="h-full flex">
              <div className="h-full" style={{ width: "40%", background: "rgba(240,237,228,0.15)" }} />
              <div className="h-full" style={{ width: "30%", background: "rgba(var(--blueshade-rgb),0.4)" }} />
              <div className="h-full" style={{ width: "30%", background: "var(--blueshade)" }} />
            </div>
          </motion.div>

          <div className="flex gap-0 border border-white/5 mb-4">
            {["< 0.40", "0.40 – 0.70", "≥ 0.70"].map((r, i) => (
              <div key={i} className={`flex-1 text-center py-2 text-[10px] tracking-widest border-r border-white/5 last:border-r-0`}
                style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.3)" }}>
                {r}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-white/5">
            {ZONES.map((z, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`p-6 ${i < 2 ? "border-r border-white/5" : ""}`}
                style={{ background: "rgba(255,255,255,0.01)" }}
              >
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: z.color, lineHeight: 1, letterSpacing: "0.02em" }}>
                  {z.label}
                </p>
                <p className="mt-2 text-white/30 text-xs leading-relaxed"
                  style={{ fontFamily: "'Space Mono', monospace", lineHeight: 1.8 }}>
                  {z.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── THREE AGENTS ── */}
        <section className="relative z-10 px-10 pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-6 h-px bg-white/20" />
            <span className="text-white/30 text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              Three agents — one graph
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-white/5">
            {AGENTS.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`p-8 group hover-lift cursor-default ${i < 2 ? "border-r border-white/5" : ""}`}
                style={{ background: "rgba(255,255,255,0.01)", transition: "transform 0.4s cubic-bezier(.23,1,.32,1)" }}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[9px] tracking-widest border px-2 py-1"
                    style={{ fontFamily: "'Space Mono', monospace", borderColor: "rgba(255,255,255,0.08)", color: "rgba(240,237,228,0.25)" }}>
                    {a.tag}
                  </span>
                </div>

                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "38px", color: a.color, lineHeight: 1, letterSpacing: "0.02em" }}>
                  {a.name}
                </h3>

                <p className="mt-4 text-white/35 leading-relaxed"
                  style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "15px" }}>
                  {a.desc}
                </p>

                <div className="mt-6 space-y-2">
                  {a.traits.map((t, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: a.color, opacity: 0.5 }} />
                      <span className="text-[10px] tracking-wider"
                        style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.25)" }}>
                        {t}
                      </span>
                    </div>
                  ))}
                </div>

                {/* hover underline */}
                <div className="mt-8 w-0 group-hover:w-full h-px transition-all duration-500"
                  style={{ background: a.color, opacity: 0.4 }} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── LANGGRAPH FLOW DIAGRAM ── */}
        <section className="relative z-10 px-10 pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-6 h-px" style={{ background: "var(--blueshade)", opacity: 0.5 }} />
            <span className="text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace", color: "rgba(var(--blueshade-rgb),0.6)" }}>
              LangGraph — stateful graph
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-white/5 p-8"
            style={{ background: "rgba(255,255,255,0.01)" }}
          >
            <svg width="100%" viewBox="0 0 700 340" style={{ overflow: "visible" }}>
              <defs>
                <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(240,237,228,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </marker>
                <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M2 1L8 5L2 9" fill="none" stroke="var(--blueshade)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </marker>
              </defs>

              {/* Query */}
              <rect x="270" y="8" width="160" height="36" rx="4" fill="rgba(240,237,228,0.04)" stroke="rgba(240,237,228,0.12)" strokeWidth="0.5"/>
              <text x="350" y="31" textAnchor="middle" fill="rgba(240,237,228,0.5)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"10px", letterSpacing:"0.15em" }}>USER QUERY</text>

              {/* Arrow down to Router */}
              <line x1="350" y1="44" x2="350" y2="76" stroke="rgba(240,237,228,0.2)" strokeWidth="0.8" markerEnd="url(#arr2)"/>

              {/* Router */}
              <rect x="224" y="76" width="252" height="44" rx="4" fill="rgba(var(--blueshade-rgb),0.08)" stroke="var(--blueshade)" strokeWidth="0.8"/>
              <text x="350" y="93" textAnchor="middle" fill="var(--blueshade)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"10px", letterSpacing:"0.15em", fontWeight:"700" }}>ROUTER</text>
              <text x="350" y="109" textAnchor="middle" fill="rgba(var(--blueshade-rgb),0.5)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px", letterSpacing:"0.1em" }}>BGE score + LLM sanity check</text>

              {/* Three branches */}
              {/* General - left */}
              <path d="M260 120 L100 164" fill="none" stroke="rgba(240,237,228,0.15)" strokeWidth="0.8" markerEnd="url(#arr2)"/>
              <text x="155" y="150" textAnchor="middle" fill="rgba(240,237,228,0.2)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px" }}>{"< 0.40"}</text>

              {/* Hybrid - center-left */}
              <path d="M320 120 L260 164" fill="none" stroke="rgba(240,237,228,0.25)" strokeWidth="0.8" markerEnd="url(#arr2)"/>
              <text x="275" y="150" textAnchor="middle" fill="rgba(240,237,228,0.2)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px" }}>{"0.40–0.70"}</text>

              {/* RAG - right */}
              <path d="M440 120 L600 164" fill="none" stroke="var(--blueshade)" strokeWidth="0.8" strokeOpacity="0.6" markerEnd="url(#arr-blue)"/>
              <text x="545" y="150" textAnchor="middle" fill="rgba(var(--blueshade-rgb),0.5)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px" }}>{"≥ 0.70"}</text>

              {/* General agent box */}
              <rect x="30" y="164" width="140" height="44" rx="4" fill="rgba(240,237,228,0.03)" stroke="rgba(240,237,228,0.1)" strokeWidth="0.5"/>
              <text x="100" y="181" textAnchor="middle" fill="rgba(240,237,228,0.4)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"9px", letterSpacing:"0.1em" }}>GENERAL</text>
              <text x="100" y="197" textAnchor="middle" fill="rgba(240,237,228,0.2)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px" }}>Pure LLM</text>

              {/* Hybrid agent box */}
              <rect x="190" y="164" width="140" height="44" rx="4" fill="rgba(240,237,228,0.03)" stroke="rgba(240,237,228,0.2)" strokeWidth="0.5"/>
              <text x="260" y="181" textAnchor="middle" fill="rgba(240,237,228,0.55)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"9px", letterSpacing:"0.1em" }}>HYBRID</text>
              <text x="260" y="197" textAnchor="middle" fill="rgba(240,237,228,0.2)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px" }}>Doc + General</text>

              {/* RAG agent box */}
              <rect x="530" y="164" width="140" height="44" rx="4" fill="rgba(var(--blueshade-rgb),0.06)" stroke="var(--blueshade)" strokeWidth="0.8"/>
              <text x="600" y="181" textAnchor="middle" fill="var(--blueshade)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"9px", letterSpacing:"0.1em", fontWeight:"700" }}>RAG AGENT</text>
              <text x="600" y="197" textAnchor="middle" fill="rgba(var(--blueshade-rgb),0.4)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px" }}>+ Query expansion</text>

              {/* All → Synthesizer */}
              <path d="M100 208 L100 252 L290 252" fill="none" stroke="rgba(240,237,228,0.12)" strokeWidth="0.8" markerEnd="url(#arr2)"/>
              <path d="M260 208 L260 252 L290 252" fill="none" stroke="rgba(240,237,228,0.15)" strokeWidth="0.8" markerEnd="url(#arr2)"/>
              <path d="M600 208 L600 252 L410 252" fill="none" stroke="var(--blueshade)" strokeWidth="0.8" strokeOpacity="0.4" markerEnd="url(#arr-blue)"/>

              {/* Synthesizer */}
              <rect x="224" y="232" width="252" height="44" rx="4" fill="rgba(240,237,228,0.03)" stroke="rgba(240,237,228,0.15)" strokeWidth="0.5"/>
              <text x="350" y="249" textAnchor="middle" fill="rgba(240,237,228,0.6)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"10px", letterSpacing:"0.15em" }}>SYNTHESIZER</text>
              <text x="350" y="265" textAnchor="middle" fill="rgba(240,237,228,0.25)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px" }}>Merges route → final_answer</text>

              <line x1="350" y1="276" x2="350" y2="296" stroke="rgba(240,237,228,0.15)" strokeWidth="0.8" markerEnd="url(#arr2)"/>

              {/* Evaluator */}
              <rect x="224" y="296" width="252" height="36" rx="4" fill="rgba(240,237,228,0.02)" stroke="rgba(240,237,228,0.1)" strokeWidth="0.5"/>
              <text x="350" y="319" textAnchor="middle" fill="rgba(240,237,228,0.4)" style={{ fontFamily:"'Space Mono',monospace", fontSize:"10px", letterSpacing:"0.15em" }}>EVALUATOR</text>
            </svg>
          </motion.div>
        </section>

        {/* ── TECH STACK ── */}
        <section className="relative z-10 px-10 pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-6 h-px bg-white/20" />
            <span className="text-white/30 text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}>Tech stack</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/5">
            {[
              ["LangGraph", "Stateful agent orchestration"],
              ["LangChain", "Chain + prompt management"],
              ["Qdrant", "Vector store + cosine search"],
              ["BGE-base-en", "768-dim sentence embeddings"],
              ["Gemini 2.5 Flash", "RAG + general generation"],
              ["Gemini 2.0 Flash", "Deterministic evaluation"],
              ["MongoDB", "Persistent chat memory"],
              ["FastAPI", "Async backend API"],
            ].map(([tech, role], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-5 border-b border-r border-white/5"
              >
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: "rgba(240,237,228,0.7)", letterSpacing: "0.05em" }}>
                  {tech}
                </p>
                <p className="mt-1 text-white/25 text-[10px] leading-relaxed"
                  style={{ fontFamily: "'Space Mono', monospace" }}>
                  {role}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <motion.section
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="relative z-10 border-t border-white/5 px-10 py-20"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <p className="text-white/20 text-sm tracking-[0.2em] uppercase mb-3"
                style={{ fontFamily: "'Space Mono', monospace" }}>
                See it in action
              </p>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,7vw,96px)", color: "#f0ede4", lineHeight: 0.95 }}>
                Upload a document.<br />
                <span style={{ color: "var(--blueshade)" }}>Ask anything.</span>
              </h2>
            </div>
            <Link to="/chat">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-12 py-5 bg-transparent border-2 transition-all duration-300"
                style={{ borderColor: "rgba(var(--blueshade-rgb),0.6)" }}
              >
                <span className="text-sm tracking-widest uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", color: "var(--blueshade)" }}>
                  Open SmartNotes →
                </span>
              </motion.button>
            </Link>
          </div>
        </motion.section>

        {/* footer */}
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