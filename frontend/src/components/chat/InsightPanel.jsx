// InsightPanel.jsx
import { motion, AnimatePresence } from "framer-motion";

const ScoreBar = ({ value, label, color = "#c6f135" }) => {
  const pct = Math.round((parseFloat(value) || 0) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.35)" }}>
          {label}
        </span>
        <span className="text-[10px]"
          style={{ fontFamily: "'Space Mono', monospace", color }}>
          {isNaN(pct) ? "—" : `${pct}%`}
        </span>
      </div>
      <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: color }} />
      </div>
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-[9px] tracking-[0.3em] uppercase"
      style={{ fontFamily: "'Space Mono', monospace", color: "rgba(198,241,53,0.45)" }}>
      {children}
    </span>
    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
  </div>
);

export const InsightPanel = ({ insight }) => {
  const { sources = [], evaluation = {} } = insight || {};
  const isEmpty = !insight;

  return (
    <div className="w-64 flex-shrink-0 flex flex-col border-l"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>

      {/* Header */}
      <div className="px-5 py-5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-[9px] tracking-[0.35em] uppercase mb-1"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(198,241,53,0.5)" }}>
          System
        </p>
        <p className="text-[11px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.3)" }}>
          Insight Panel
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6 space-y-8">

        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center mt-12 gap-3">
              <div className="w-8 h-8 border rotate-45"
                style={{ borderColor: "rgba(198,241,53,0.1)" }} />
              <p className="text-[9px] tracking-[0.2em] uppercase leading-loose"
                style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.15)" }}>
                Send a message to see<br />sources & evaluation
              </p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }} className="space-y-8">

              {/* ── EVALUATION ── */}
              <div>
                <SectionLabel>Evaluation</SectionLabel>

                <div className="space-y-4">
                  <ScoreBar
                    label="Confidence"
                    value={evaluation?.relevance_score}
                    color="#c6f135"
                  />
                  <ScoreBar
                    label="Context usage"
                    value={evaluation?.context_usage}
                    color="rgba(198,241,53,0.5)"
                  />
                </div>

                {/* Hallucination badge */}
                <div className="mt-5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${evaluation?.hallucination ? "bg-red-400" : "bg-[#c6f135]"}`}
                    style={{ boxShadow: evaluation?.hallucination ? "0 0 6px rgba(248,113,113,0.6)" : "0 0 6px rgba(198,241,53,0.6)" }} />
                  <span className="text-[10px] tracking-widest uppercase"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      color: evaluation?.hallucination ? "rgba(248,113,113,0.7)" : "rgba(198,241,53,0.7)",
                    }}>
                    {evaluation?.hallucination ? "Hallucination risk" : "Grounded"}
                  </span>
                </div>
              </div>

              {/* ── SOURCES ── */}
              {sources.length > 0 && (
                <div>
                  <SectionLabel>Retrieved Sources</SectionLabel>

                  <div className="space-y-3">
                    {sources.slice(0, 3).map((s, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="relative pl-3"
                        style={{ borderLeft: "1px solid rgba(198,241,53,0.2)" }}>
                        <p className="text-[9px] tracking-[0.2em] uppercase mb-1"
                          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(198,241,53,0.4)" }}>
                          Chunk {i + 1}
                        </p>
                        <p className="text-[11px] leading-relaxed line-clamp-4"
                          style={{
                            fontFamily: "'Instrument Serif', serif",
                            fontStyle: "italic",
                            color: "rgba(240,237,228,0.4)",
                            lineHeight: "1.6",
                          }}>
                          {s.text || s}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SYSTEM INFO ── */}
              <div>
                <SectionLabel>System</SectionLabel>
                <div className="space-y-2">
                  {[
                    ["Model", "Claude / RAG"],
                    ["Retrieval", "Semantic"],
                    ["Storage", "Qdrant + Mongo"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-1 border-b"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <span className="text-[9px] tracking-widest uppercase"
                        style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.2)" }}>
                        {k}
                      </span>
                      <span className="text-[9px] tracking-wide"
                        style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.35)" }}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-[9px] tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.12)" }}>
          ✦ Transparency layer
        </p>
      </div>
    </div>
  );
};
