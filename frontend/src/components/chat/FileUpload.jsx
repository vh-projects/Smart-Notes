// FileUpload.jsx

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, FileText } from "lucide-react";
const API_BASE = import.meta.env.VITE_API_URL;

export const FileUpload = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus("Initialising…");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE}/api/upload-stream`, { method: "POST", body: formData });
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split("\n\n");
        buffer = messages.pop();
        for (const msg of messages) {
          if (msg.startsWith("data:")) {
            const data = JSON.parse(msg.replace("data:", "").trim());
            setStatus(data.status || "");
            if (data.doc_id) {
              setDone(true);
              setUploading(false);
              setStatus("Complete");
              onFileUploaded({ id: data.doc_id, doc_id: data.doc_id, name: file.name });
            }
          }
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus("Connection error — check backend.");
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10">

      {/* heading */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }} className="text-center mb-12">
        <p className="text-[9px] tracking-[0.4em] uppercase mb-4"
          style={{ fontFamily: "'Space Mono', monospace", color: "var(--blueshade)" }}>
          New Document
        </p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 6vw, 72px)", color: "#f0ede4", lineHeight: 0.95, letterSpacing: "0.03em" }}>
          Upload a PDF
        </h2>
        <p className="mt-3"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "16px", color: "rgba(240,237,228,0.35)" }}>
          Your document stays private and local.
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="w-full max-w-md"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}>

        <div className="relative border transition-all duration-300 p-10 flex flex-col items-center gap-4 cursor-pointer"
          // style={{
          //   borderColor: dragging ? "rgba(198,241,53,0.5)" : file ? "rgba(198,241,53,0.25)" : "rgba(255,255,255,0.08)",
          //   background: dragging ? "rgba(198,241,53,0.04)" : "rgba(0,0,0,0.15)",
          // }}
          
          style={{
            borderColor: dragging ? "[var(--blueshade)]" : file ? "var(--blueshade)" : "rgba(255,255,255,0.08)",
            background: dragging ? "rgba(198,241,53,0.04)" : "rgba(0,0,0,0.15)",
          }}          
          
          onClick={() => inputRef.current?.click()}>

          <input ref={inputRef} type="file" accept="application/pdf"
            className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

          {/* Icon */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="absolute inset-0 border border-[#c6f135]/20 rotate-45" />
            {file
              // ? <FileText size={22} style={{ color: "#c6f135" }} />
              ? <FileText size={22} style={{ color: "var(--blueshade)" }} />
              : <Upload size={20} style={{ color: "rgba(240,237,228,0.3)" }} />}
          </div>

          {/* Label */}
          <div className="text-center">
            {file ? (
              <>
                <p className="text-[11px] tracking-widest"
                  // style={{ fontFamily: "'Space Mono', monospace", color: "#c6f135" }}>
                  style={{ fontFamily: "'Space Mono', monospace", color: "var(--blueshade)" }}>
                  {file.name}
                </p>
                <p className="text-[9px] tracking-widest mt-1"
                  style={{ fontFamily: "'Space Mono', monospace", color: "var(--lightsand)" }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] tracking-[0.2em] uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.3)" }}>
                  Drop PDF here
                </p>
                <p className="text-[9px] tracking-widest mt-1"
                  style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.15)" }}>
                  or click to browse
                </p>
              </>
            )}
          </div>

          {/* Corner ornaments */}
          {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
            // <div key={pos} className={`absolute ${pos} w-2 h-2`}
            //   style={{
            //     borderTop: pos.includes("top") ? "1px solid rgba(198,241,53,0.3)" : "none",
            //     borderBottom: pos.includes("bottom") ? "1px solid rgba(198,241,53,0.3)" : "none",
            //     borderLeft: pos.includes("left") ? "1px solid rgba(198,241,53,0.3)" : "none",
            //     borderRight: pos.includes("right") ? "1px solid rgba(198,241,53,0.3)" : "none",
            //   }} />


            <div key={pos} className={`absolute ${pos} w-2 h-2`}
              style={{
                borderTop: pos.includes("top") ? "1px solid var(--blueshade)" : "none",
                borderBottom: pos.includes("bottom") ? "1px solid var(--blueshade)" : "none",
                borderLeft: pos.includes("left") ? "1px solid var(--blueshade)" : "none",
                borderRight: pos.includes("right") ? "1px solid var(--blueshade)" : "none",
              }} />

          ))}
        </div>

        {/* Upload button */}
        <AnimatePresence>
          {file && !done && (
            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              onClick={handleUpload} disabled={uploading}
              className="mt-4 w-full py-3 flex items-center justify-center gap-3 transition-all duration-200"
              // style={{
              //   background: uploading ? "rgba(198,241,53,0.05)" : "rgba(198,241,53,0.1)",
              //   border: "1px solid rgba(198,241,53,0.3)",
              // }}>

              style={{
                background: uploading ? "var(--blueshade)" : "var(--blueshade)",
                border: "1px solid var(lighter-blueshade)",
              }}>



              {uploading
                // ? <><Loader2 size={13} className="animate-spin" style={{ color: "#c6f135" }} />
                ? <><Loader2 size={13} className="animate-spin" style={{ color: "var(--golden)" }} />
                  <span className="text-[10px] tracking-[0.25em] uppercase"
                    style={{ fontFamily: "'Space Mono', monospace", color: "var(--golden)" }}>
                    {status || "Uploading…"}
                  </span>
                </>
                : <span className="text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", color: "var(--golden)" }}>
                  Upload PDF →
                </span>}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Status */}
        <AnimatePresence>
          {status && !uploading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-3 px-4 py-2 text-center"
              style={{ border: "1px solid rgba(198,241,53,0.15)", background: "rgba(198,241,53,0.04)" }}>
              <span className="text-[10px] tracking-widest"
                style={{ fontFamily: "'Space Mono', monospace", color: "var(--blueshade)" }}>
                {done ? "✦ " : ""}{status}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
