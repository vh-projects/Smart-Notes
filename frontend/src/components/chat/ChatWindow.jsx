// // ChatWindow.jsx

// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";
// import { Send } from "lucide-react";
// const API_BASE = import.meta.env.VITE_API_URL;

// export const ChatWindow = ({ chatId, onInsightUpdate }) => {
//   const [messages, setMessages] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [typingText, setTypingText] = useState("");

//   const [showQuotaPopup, setShowQuotaPopup] = useState(false);
//   const chatEndRef = useRef(null);
//   const textareaRef = useRef(null);

//   useEffect(() => {
//     if (!chatId) return;
//     setMessages([]);
//     const fetchHistory = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/api/conversations/${chatId}`);

//         if (res.status === 429) {
//           setShowQuotaPopup(true);
//           setIsLoading(false);
//           return;
//         }

//         if (!res.ok) throw new Error("Failed to fetch");
//         const data = await res.json();
//         if (data?.history) {
//           const mapped = data.history.map((m) => ({
//             role: m.role,
//             text: m.content,
//             sources: data.sources || [],
//             evaluation: data.evaluation || {},
//           }));
//           setMessages(mapped);
//         }
//       }
      
//       catch (err) {
//         console.error("Error fetching chat history:", err);
//       }
//     };
//     fetchHistory();
//   }, [chatId]);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, typingText]);

//   const handleSend = async () => {
//     if (!question.trim() || !chatId || isLoading) return;
//     const userMsg = { role: "user", text: question };
//     setMessages((m) => [...m, userMsg]);
//     setQuestion("");
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("doc_id", chatId);
//       formData.append("question", question);
//       const res = await fetch(`${API_BASE}/api/query`, { method: "POST", body: formData });
//       const data = await res.json();
//       const aiMsg = { role: "assistant", text: data.answer, sources: data.sources || [], evaluation: data.evaluation || {} };
//       onInsightUpdate?.({ sources: aiMsg.sources, evaluation: aiMsg.evaluation });
//       setIsLoading(false);
//       await simulateTyping(aiMsg.text, aiMsg.sources, aiMsg.evaluation);
//     } catch (err) {
//       console.error("Error querying:", err);
//       setIsLoading(false);
//     }
//   };

//   const simulateTyping = async (fullText, sources, evaluation) => {
//     setTypingText("");
//     for (let i = 0; i < fullText.length; i++) {
//       setTypingText((prev) => prev + fullText[i]);
//       await new Promise((r) => setTimeout(r, 12));
//     }
//     setMessages((prev) => [...prev, { role: "assistant", text: fullText, sources, evaluation }]);
//     setTypingText("");
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//   };

//   return (
//     <div className="flex-1 flex flex-col h-full overflow-hidden">

//       {/* Top bar */}
//       <div className="flex-shrink-0 px-8 py-4 border-b flex items-center gap-4"
//         style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
//         <div className="w-1.5 h-1.5 rounded-full bg-[#c6f135]" style={{ boxShadow: "0 0 6px #c6f135" }} />
//         <span className="text-[10px] tracking-[0.25em] uppercase"
//           style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.3)" }}>
//           Active Session
//         </span>
//         <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
//         <span className="text-[9px] tracking-widest"
//           style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.15)" }}>
//           {messages.filter(m => m.role === "user").length} queries
//         </span>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 space-y-8">

//         {/* Empty state */}
//         {messages.length === 0 && !isLoading && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
//             className="flex flex-col items-center justify-center h-full text-center gap-6">

//             <div className="relative">
//               <div className="absolute inset-0 w-24 h-24 border border-[#c6f135]/10 rotate-45 mx-auto" style={{ margin: "auto", left: 0, right: 0 }} />
//               <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "72px", color: "rgba(198,241,53,0.08)", lineHeight: 1, letterSpacing: "0.05em" }}>
//                 ASK
//               </p>
//             </div>

//             <div className="space-y-2">
//               <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "22px", color: "rgba(240,237,228,0.4)" }}>
//                 Your document is ready.
//               </p>
//               <p className="text-[10px] tracking-[0.25em] uppercase"
//                 style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.2)" }}>
//                 Ask anything — every answer is source-backed
//               </p>
//             </div>

//             {/* Suggested prompts */}
//             <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
//               {["Summarize this document", "What are the key findings?", "List the main arguments"].map((prompt) => (
//                 <button key={prompt} onClick={() => { setQuestion(prompt); textareaRef.current?.focus(); }}
//                   className="px-3 py-1.5 border text-[10px] tracking-wider uppercase transition-all duration-200 hover:border-[#c6f135]/50 hover:text-[#c6f135]/70"
//                   style={{ fontFamily: "'Space Mono', monospace", borderColor: "rgba(255,255,255,0.08)", color: "rgba(240,237,228,0.25)" }}>
//                   {prompt}
//                 </button>
//               ))}
//             </div>
//           </motion.div>
//         )}

//         {/* Message list */}
//         <AnimatePresence initial={false}>
//           {messages.map((msg, idx) => (
//             <motion.div key={idx}
//               initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
//               className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

//               {msg.role === "user" ? (
//                 /* USER bubble */
//                 <div className="max-w-[55%]">
//                   <div className="px-4 py-3 text-sm leading-relaxed"
//                     style={{
//                       background: "rgba(198,241,53,0.08)",
//                       border: "1px solid rgba(198,241,53,0.2)",
//                       fontFamily: "'Instrument Serif', serif",
//                       fontStyle: "italic",
//                       fontSize: "15px",
//                       color: "rgba(240,237,228,0.85)",
//                     }}>
//                     {msg.text}
//                   </div>
//                   <p className="text-right mt-1 text-[9px] tracking-widest"
//                     style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.2)" }}>
//                     You
//                   </p>
//                 </div>
//               ) : (
//                 /* ASSISTANT message — full width editorial */
//                 <div className="w-full max-w-2xl">
//                   {/* Role label */}
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="w-4 h-px bg-[#c6f135]/40" />
//                     <span className="text-[9px] tracking-[0.3em] uppercase text-[#c6f135]/50"
//                       style={{ fontFamily: "'Space Mono', monospace" }}>
//                       SmartNotes
//                     </span>
//                   </div>

//                   {/* Answer body */}
//                   <div className="prose prose-invert max-w-none"
//                     style={{ fontFamily: "'Instrument Serif', serif", fontSize: "17px", lineHeight: "1.75", color: "rgba(240,237,228,0.85)" }}>
//                     <ReactMarkdown
//                       remarkPlugins={[remarkGfm]}
//                       rehypePlugins={[rehypeHighlight]}
//                       components={{
//                         p: ({ children }) => <p style={{ marginBottom: "0.75em", fontFamily: "'Instrument Serif', serif", fontSize: "17px" }}>{children}</p>,
//                         h1: ({ children }) => <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "0.05em", color: "#f0ede4", marginBottom: "0.5em" }}>{children}</h1>,
//                         h2: ({ children }) => <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "0.05em", color: "#f0ede4", marginBottom: "0.4em" }}>{children}</h2>,
//                         h3: ({ children }) => <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(198,241,53,0.7)", marginBottom: "0.4em" }}>{children}</h3>,
//                         li: ({ children }) => (
//                           <li style={{ listStyle: "none", paddingLeft: "1rem", position: "relative", marginBottom: "0.35em" }}>
//                             <span style={{ position: "absolute", left: 0, color: "#c6f135", opacity: 0.5 }}>—</span>
//                             {children}
//                           </li>
//                         ),
//                         code({ inline, className, children }) {
//                           return !inline ? (
//                             <pre style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", padding: "1rem", fontSize: "13px", borderRadius: 0, overflowX: "auto" }}>
//                               <code className={className}>{String(children).replace(/\n$/, "")}</code>
//                             </pre>
//                           ) : (
//                             <code style={{ background: "rgba(198,241,53,0.08)", color: "#c6f135", padding: "1px 6px", fontSize: "13px", fontFamily: "'Space Mono', monospace" }}>
//                               {children}
//                             </code>
//                           );
//                         },
//                         strong: ({ children }) => <strong style={{ color: "#f0ede4", fontWeight: 700 }}>{children}</strong>,
//                       }}>
//                       {msg.text}
//                     </ReactMarkdown>
//                   </div>

//                   {/* Bottom rule */}
//                   <div className="mt-6 h-px w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
//                 </div>
//               )}
//             </motion.div>
//           ))}
//         </AnimatePresence>

//         {/* Typing indicator */}
//         {typingText && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl">
//             <div className="flex items-center gap-3 mb-3">
//               <div className="w-4 h-px bg-[#c6f135]/40" />
//               <span className="text-[9px] tracking-[0.3em] uppercase text-[#c6f135]/50"
//                 style={{ fontFamily: "'Space Mono', monospace" }}>SmartNotes</span>
//             </div>
//             <div className="prose prose-invert max-w-none"
//               style={{ fontFamily: "'Instrument Serif', serif", fontSize: "17px", lineHeight: "1.75", color: "rgba(240,237,228,0.85)" }}>
//               <ReactMarkdown remarkPlugins={[remarkGfm]}>{typingText}</ReactMarkdown>
//             </div>
//           </motion.div>
//         )}

//         {/* Loading shimmer */}
//         {isLoading && !typingText && (
//           <div className="flex items-center gap-3">
//             <div className="w-4 h-px bg-[#c6f135]/40" />
//             <div className="flex gap-1">
//               {[0, 1, 2].map((i) => (
//                 <motion.div key={i} className="w-1 h-1 rounded-full"
//                   style={{ background: "rgba(198,241,53,0.5)" }}
//                   animate={{ opacity: [0.2, 1, 0.2] }}
//                   transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }} />
//               ))}
//             </div>
//           </div>
//         )}

//         <div ref={chatEndRef} />
//       </div>

//       {/* Input bar */}
//       <div className="flex-shrink-0 border-t px-8 py-5"
//         style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
//         <div className="flex items-end gap-4 border transition-colors duration-200 px-4 py-3 focus-within:border-[#c6f135]/30"
//           style={{ borderColor: "rgba(255,255,255,0.08)" }}>
//           <textarea ref={textareaRef}
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask anything about your document…"
//             rows={1}
//             className="flex-1 resize-none bg-transparent outline-none leading-relaxed"
//             style={{
//               fontFamily: "'Instrument Serif', serif",
//               fontStyle: "italic",
//               fontSize: "15px",
//               color: "rgba(240,237,228,0.8)",
//               maxHeight: "120px",
//               overflowY: "auto",
//             }}
//             onInput={(e) => {
//               e.target.style.height = "auto";
//               e.target.style.height = e.target.scrollHeight + "px";
//             }}
//           />
//           <button onClick={handleSend} disabled={isLoading || !question.trim()}
//             className="flex-shrink-0 w-8 h-8 flex items-center justify-center border transition-all duration-200 disabled:opacity-20"
//             style={{
//               borderColor: question.trim() ? "rgba(198,241,53,0.5)" : "rgba(255,255,255,0.1)",
//               background: question.trim() ? "rgba(198,241,53,0.08)" : "transparent",
//             }}>
//             <Send size={13} style={{ color: question.trim() ? "#c6f135" : "rgba(240,237,228,0.3)" }} />
//           </button>
//         </div>
//         <p className="mt-2 text-[9px] tracking-widest text-right"
//           style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.15)" }}>
//           ↵ send · shift+↵ newline
//         </p>
//       </div>


//       <AnimatePresence>
//         {showQuotaPopup && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="w-full max-w-md p-8 border"
//               style={{
//                 background: "#0a0d06",
//                 borderColor: "rgba(255,255,255,0.08)"
//               }}
//             >
//               {/* Label */}
//               <p
//                 className="text-[10px] tracking-[0.3em] uppercase mb-4"
//                 style={{ fontFamily: "'Space Mono', monospace", color: "rgba(198,241,53,0.6)" }}
//               >
//                 System Notice
//               </p>

//               {/* Heading */}
//               <h2
//                 className="mb-4"
//                 style={{
//                   fontFamily: "'Bebas Neue', sans-serif",
//                   fontSize: "42px",
//                   lineHeight: 1,
//                   color: "#f0ede4"
//                 }}
//               >
//                 API LIMIT REACHED
//               </h2>

//               {/* Message */}
//               <p
//                 className="mb-6 leading-relaxed"
//                 style={{
//                   fontFamily: "'Instrument Serif', serif",
//                   fontStyle: "italic",
//                   color: "rgba(240,237,228,0.6)"
//                 }}
//               >
//                 This system runs on Google’s free API tier.
//                 You’ve reached today’s limit — it resets automatically tomorrow.
//               </p>

//               {/* CTA */}
//               <button
//                 onClick={() => setShowQuotaPopup(false)}
//                 className="w-full py-3 border transition-all duration-300 hover:bg-[#c6f135]/10"
//                 style={{
//                   borderColor: "rgba(198,241,53,0.5)",
//                   fontFamily: "'Space Mono', monospace",
//                   fontSize: "11px",
//                   letterSpacing: "0.2em",
//                   color: "#c6f135"
//                 }}
//               >
//                 UNDERSTOOD
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>


//     </div>


//   );
// };








// ChatWindow.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Send } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

export const ChatWindow = ({ chatId, onInsightUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [showQuotaPopup, setShowQuotaPopup] = useState(false);

  const streamedTextRef = useRef("");
  const isStreamingRef = useRef(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);


  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    // ✅ Reset insight panel when switching chats
    onInsightUpdate?.(null);

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/conversations/${chatId}`);

        if (res.status === 429) {
          setShowQuotaPopup(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        if (data?.history) {
          // ✅ History messages don't carry sources/evaluation — don't fake empty ones
          const mapped = data.history.map((m) => ({
            role: m.role,
            text: m.content,
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };
    fetchHistory();
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);



  const displayedTextRef = useRef("");


  const handleSend = async () => {
    if (!question.trim() || !chatId || isLoading) return;

    const userMessage = {
      role: "user", text: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    const sentQuestion = question;
    setQuestion("");
    setIsLoading(true);
    setTypingText("");

    try {
      const formData = new FormData();
      formData.append("doc_id", chatId);
      formData.append("question", sentQuestion);

      const response = await fetch(
        `${API_BASE}/api/query-stream`,
        {
          method: "POST", body: formData,
        }
      );

      if (response.status === 429) {
        setShowQuotaPopup(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Streaming request failed.");
      }

      isStreamingRef.current = true;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let finalAnswer = "";
      let sources = [];
      let evaluation = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          const lines = rawEvent.split("\n");

          let eventType = "";
          let eventData = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace("event:", "").trim();
            }

            if (line.startsWith("data:")) {
              eventData += line.replace("data:", "").trim();
            }
          }

          switch (eventType) {

            case "status": {
              const status = JSON.parse(eventData);
              console.log(status.step, status.message);
              break;
            }


            case "token": {
              const token = JSON.parse(eventData);

              finalAnswer += token;

              streamedTextRef.current = finalAnswer;

              simulateTypingStream();

              break;
            }

            case "sources": {
              sources = JSON.parse(eventData);
              break;
            }

            case "evaluation": {
              evaluation = JSON.parse(eventData);
              onInsightUpdate?.({
                sources, evaluation,
              });

              break;
            }



            case "done": {

              isStreamingRef.current = false;

              while (displayedTextRef.current !== streamedTextRef.current) {
                await new Promise(r => setTimeout(r, 20));
              }

              setMessages(prev => [
                ...prev,
                {
                  role: "assistant",
                  text: finalAnswer,
                  sources,
                  evaluation
                }
              ]);

              streamedTextRef.current = "";

              setTypingText("");

              setIsLoading(false);

              break;
            }



            case "error": {
              const err = JSON.parse(eventData);
              throw new Error(err.message);
            }

            default:
              break;
          }
        }
      }
    } catch (err) {

      console.error(err);
      setTypingText("");
      setIsLoading(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong. Please try again.",
        },
      ]);
    }
  };


  const simulateTypingStream = async () => {

    if (simulateTypingStream.running) return;

    simulateTypingStream.running = true;

    let displayed = "";
    setTypingText("");

    while (true) {

      const target = streamedTextRef.current;

      // More streamed text has arrived
      if (displayed.length < target.length) {

        // displayed = target.slice(0, displayed.length + 3);
        // setTypingText(displayed);

        displayed = target.slice(0, displayed.length + 9);
        displayedTextRef.current = displayed;
        setTypingText(displayed);

        await new Promise(r => setTimeout(r, 16));

        continue;
      }

      // Backend finished and we're fully caught up
      if (!isStreamingRef.current &&
        displayed.length === streamedTextRef.current.length) {
        break;
      }

      // Wait for additional streamed tokens
      await new Promise(r => setTimeout(r, 15));
    }

    simulateTypingStream.running = false;
  };

  simulateTypingStream.running = false;



  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      {/* Top bar */}
      <div className="flex-shrink-0 px-8 py-4 border-b flex items-center gap-4"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--blueshade)]"
          style={{ boxShadow: "0 0 6px var(--golden)" }} />
        <span className="text-[10px] tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.3)" }}>
          Active Session
        </span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
        <span className="text-[9px] tracking-widest"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.15)" }}>
          {messages.filter((m) => m.role === "user").length} queries
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 space-y-8">

        {messages.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 w-24 h-24 border border-[#c6f135]/10 rotate-45 mx-auto"
                style={{ margin: "auto", left: 0, right: 0 }} />
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "72px", color: "rgba(198,241,53,0.08)", lineHeight: 1, letterSpacing: "0.05em" }}>
                ASK
              </p>
            </div>
            <div className="space-y-2">
              <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "22px", color: "rgba(240,237,228,0.4)" }}>
                Your document is ready.
              </p>
              <p className="text-[10px] tracking-[0.25em] uppercase"
                style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.2)" }}>
                Ask anything — every answer is source-backed
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
              {["Summarize this document", "What are the key findings?", "List the main arguments"].map((prompt) => (
                <button key={prompt}
                  onClick={() => { setQuestion(prompt); textareaRef.current?.focus(); }}
                  className="px-3 py-1.5 border text-[10px] tracking-wider uppercase transition-all duration-200 hover:border-[#c6f135]/50 hover:text-[#c6f135]/70"
                  style={{ fontFamily: "'Space Mono', monospace", borderColor: "rgba(255,255,255,0.08)", color: "rgba(240,237,228,0.25)" }}>
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

              {msg.role === "user" ? (
                <div className="max-w-[55%]">
                  <div className="px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: "var(--side-blueshade)",
                      border: "1px solid var(--blueshade-rgb)",
                      fontFamily: "'Junge', static",
                      fontStyle: "italic",
                      fontSize: "15px",
                      color: "rgba(240,237,228,0.85)",
                    }}>
                    {msg.text}
                  </div>
                  <p className="text-right mt-1 text-[9px] tracking-widest"
                    style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.2)" }}>
                    You
                  </p>
                </div>
              ) : (
                // Change View
                <div className="w-full max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-4 h-px bg-[var(--blueshade)]" />
                    <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--blueshade)]"
                      style={{ fontFamily: "'Space Mono', monospace" }}>
                      SmartNotes
                    </span>
                    {/* ✅ Show route badge per message */}
                    {msg.evaluation?.route && (
                      <span className="text-[8px] tracking-widest uppercase px-2 py-0.5 border"
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          borderColor: msg.evaluation.route === "rag"
                            ? "rgba(var(--blueshade-rgb), 0.3)"
                            : "rgba(255,255,255,0.1)",

                          color: msg.evaluation.route === "rag"
                            ? "var(--lighter-blueshade)"
                            : "rgba(240,237,228,0.3)",

                        }}>
                        {msg.evaluation.route === "rag" ? "RAG" : "General"}
                      </span>
                    )}
                  </div>

                  <div className="prose prose-invert max-w-none"
                    style={{ fontFamily: "'Instrument Serif', serif", fontSize: "17px", lineHeight: "1.75", color: "rgba(240,237,228,0.85)" }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        p: ({ children }) => <p style={{ marginBottom: "0.75em", fontFamily: "'Instrument Serif', serif", fontSize: "17px" }}>{children}</p>,
                        h1: ({ children }) => <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "0.05em", color: "#f0ede4", marginBottom: "0.5em" }}>{children}</h1>,
                        h2: ({ children }) => <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "0.05em", color: "#f0ede4", marginBottom: "0.4em" }}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{
                          fontFamily: "'Space Mono', monospace", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase",
                          // color: "rgba(198,241,53,0.7)",
                          color: "var(--lighter-blueshade)",
                          marginBottom: "0.4em"
                        }}>{children}</h3>,
                        li: ({ children }) => (
                          <li style={{ listStyle: "none", paddingLeft: "1rem", position: "relative", marginBottom: "0.35em" }}>
                            <span style={{ position: "absolute", left: 0, color: "var(--lighter-blueshade)", opacity: 0.5 }}>—</span>
                            {children}
                          </li>
                        ),
                        code({ inline, className, children }) {
                          return !inline ? (
                            <pre style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", padding: "1rem", fontSize: "13px", borderRadius: 0, overflowX: "auto" }}>
                              <code className={className}>{String(children).replace(/\n$/, "")}</code>
                            </pre>
                          ) : (
                            <code style={{ background: "rgba(198,241,53,0.08)", color: "var(--lighter-blueshade)", padding: "1px 6px", fontSize: "13px", fontFamily: "'Space Mono', monospace" }}>
                              {children}
                            </code>
                          );
                        },
                        strong: ({ children }) => <strong style={{ color: "#f0ede4", fontWeight: 700 }}>{children}</strong>,


                        table: ({ children }) => (
                          <div
                            style={{
                              width: "100%",
                              overflowX: "auto",
                              margin: "1.25rem 0",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                            className="custom-scrollbar"
                          >
                            <table
                              style={{
                                width: "100%",
                                minWidth: "500px",
                                borderCollapse: "collapse",
                                fontFamily: "'Space Mono', monospace",
                                fontSize: "12px",
                              }}
                            >
                              {children}
                            </table>
                          </div>
                        ),

                        thead: ({ children }) => (
                          <thead
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              borderBottom: "1px solid rgba(255,255,255,0.12)",
                            }}
                          >
                            {children}
                          </thead>
                        ),

                        tbody: ({ children }) => (
                          <tbody>
                            {children}
                          </tbody>
                        ),

                        tr: ({ children }) => (
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            {children}
                          </tr>
                        ),

                        th: ({ children }) => (
                          <th
                            style={{
                              padding: "10px 14px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "var(--lighter-blueshade)",
                              whiteSpace: "nowrap",
                              borderRight: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            {children}
                          </th>
                        ),

                        td: ({ children }) => (
                          <td
                            style={{
                              padding: "10px 14px",
                              color: "rgba(240,237,228,0.75)",
                              verticalAlign: "top",
                              borderRight: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            {children}
                          </td>
                        ),


                      }}>



                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-6 h-px w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing animation */}
        {typingText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-4 h-px bg-[#c6f135]/40" />
              <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--lighter-blueshade)]"
                style={{ fontFamily: "'Space Mono', monospace" }}>SmartNotes</span>
            </div>
            <div className="prose prose-invert max-w-none"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "17px", lineHeight: "1.75", color: "rgba(240,237,228,0.85)" }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  table: ({ children }) => (
                    <div
                      style={{
                        width: "100%",
                        overflowX: "auto",
                        margin: "1.25rem 0",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      className="custom-scrollbar"
                    >
                      <table
                        style={{
                          width: "100%",
                          minWidth: "500px",
                          borderCollapse: "collapse",
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "12px",
                        }}
                      >
                        {children}
                      </table>
                    </div>
                  ),

                  thead: ({ children }) => (
                    <thead
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderBottom: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {children}
                    </thead>
                  ),

                  tbody: ({ children }) => (
                    <tbody>{children}</tbody>
                  ),

                  tr: ({ children }) => (
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {children}
                    </tr>
                  ),

                  th: ({ children }) => (
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--lighter-blueshade)",
                        whiteSpace: "nowrap",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "rgba(240,237,228,0.75)",
                        verticalAlign: "top",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {children}
                    </td>
                  ),
                }}


              >{typingText}</ReactMarkdown>
            </div>
          </motion.div>
        )}

        {/* Loading dots */}
        {isLoading && !typingText && (
          <div className="flex items-center gap-3">
            <div className="w-4 h-px bg-[var(--lighter-blueshade)]" />
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1 h-1 rounded-full"
                  style={{ background: "var(--lighter-blueshade)" }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }} />
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t px-8 py-5"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
        <div className="flex items-end gap-4 border transition-colors duration-200 px-4 py-3 focus-within:border-[#c6f135]/30"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <textarea ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your document…"
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none leading-relaxed"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontSize: "15px",
              color: "rgba(240,237,228,0.8)",
              maxHeight: "120px",
              overflowY: "auto",
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
          />
          <button onClick={handleSend} disabled={isLoading || !question.trim()}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center border transition-all duration-200 disabled:opacity-20"
            style={{
              borderColor: question.trim() ? "var(--lighter-blueshade)" : "rgba(255,255,255,0.1)",
              background: question.trim() ? "var(--side-blueshade)" : "transparent",
            }}>
            <Send size={13} style={{ color: question.trim() ? "var(--blueshade)" : "rgba(240,237,228,0.3)" }} />
          </button>
        </div>
        <p className="mt-2 text-[9px] tracking-widest text-right"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.15)" }}>
          ↵ send · shift+↵ newline
        </p>
      </div>

      {/* Quota popup — unchanged */}
      <AnimatePresence>
        {showQuotaPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.3 }}
              className="w-full max-w-md p-8 border"
              style={{ background: "#0a0d06", borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ fontFamily: "'Space Mono', monospace", color: "rgba(198,241,53,0.6)" }}>
                System Notice
              </p>
              <h2 className="mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", lineHeight: 1, color: "#f0ede4" }}>
                API LIMIT REACHED
              </h2>
              <p className="mb-6 leading-relaxed"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "rgba(240,237,228,0.6)" }}>
                This system runs on Google's free API tier. You've reached today's limit — it resets automatically tomorrow.
              </p>
              <button onClick={() => setShowQuotaPopup(false)}
                className="w-full py-3 border transition-all duration-300 hover:bg-[#c6f135]/10"
                style={{ borderColor: "rgba(198,241,53,0.5)", fontFamily: "'Space Mono', monospace", fontSize: "11px", letterSpacing: "0.2em", color: "#c6f135" }}>
                UNDERSTOOD
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

