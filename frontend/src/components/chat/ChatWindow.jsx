// ChatWindow.jsx

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 text-xs px-2 py-1 bg-fern_green/30 text-timberwolf rounded hover:bg-fern_green/60 transition"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

export const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const chatEndRef = useRef(null);

  // ✅ Fetch previous chat history when chatId changes
  useEffect(() => {
    if (!chatId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/conversations/${chatId}`);
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();
        if (data?.history) {
          const mapped = data.history.map((m) => ({
            role: m.role,
            text: m.content,
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error("❌ Error fetching chat history:", err);
      }
    };

    fetchHistory();
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  const handleSend = async () => {
    if (!question.trim() || !chatId) return;

    const userMsg = { role: "user", text: question };
    setMessages((m) => [...m, userMsg]);
    setQuestion("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("doc_id", chatId);
      formData.append("question", question);

      const res = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const aiMsg = { role: "assistant", text: data.answer };
      setIsLoading(false);
      await simulateTyping(aiMsg.text, aiMsg.role);
    } catch (err) {
      console.error("Error querying:", err);
      setIsLoading(false);
    }
  };

  const simulateTyping = async (fullText, role) => {
    setTypingText("");
    const speed = 15;
    for (let i = 0; i < fullText.length; i++) {
      setTypingText((prev) => prev + fullText[i]);
      await new Promise((resolve) => setTimeout(resolve, speed));
    }
    setMessages((prev) => [...prev, { role, text: fullText }]);
    setTypingText("");
  };

  return (
    <div className="flex-1 flex flex-col bg-brunswick_green h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <p className="text-timberwolf/60 text-center mt-20">
            Ask a question about your PDF ✨
          </p>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`whitespace-pre-wrap overflow-hidden rounded-lg break-all ${
              msg.role === "user"
                ? "bg-fern_green text-timberwolf self-end max-w-[45%] ml-auto px-4 py-3"
                : "bg-gradient-to-b from-hunter_green/90 to-hunter_green/70 text-timberwolf/95 shadow-xl border border-fern_green/20 max-w-4xl w-full self-center px-8 py-6"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="prose prose-invert max-w-none leading-relaxed text-[16px] break-all">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const codeText = String(children).replace(/\n$/, "");
                      return !inline ? (
                        <div className="relative group">
                          <pre {...props} className="overflow-x-auto">
                            <code className={className}>{codeText}</code>
                          </pre>
                          <CopyButton text={codeText} />
                        </div>
                      ) : (
                        <code className="bg-[#1b1b1b] text-fern_green px-1.5 py-0.5 rounded break-all">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ) : (
              <span className="break-all whitespace-pre-wrap">{msg.text}</span>
            )}
          </motion.div>
        ))}

        {typingText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl max-w-4xl self-center w-full bg-gradient-to-b from-hunter_green/90 to-hunter_green/70 text-timberwolf/95 shadow-xl border border-fern_green/20 px-8 py-6 break-all"
          >
            <div className="prose prose-invert max-w-none leading-relaxed text-[16px] break-all">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {typingText}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}

        {isLoading && !typingText && (
          <div className="self-center max-w-3xl w-full bg-hunter_green/80 text-gray-400 px-6 py-4 rounded-lg relative overflow-hidden border border-fern_green/20">
            <div className="italic text-sm">Generating answer...</div>
            <motion.div
              className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-fern_green/15 to-transparent"
              animate={{ x: ["-100%", "150%"] }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
            />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-fern_green/40 bg-hunter_green p-3 flex items-center space-x-3 sticky bottom-0 left-0">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 resize-none bg-brunswick_green text-timberwolf border-none focus:ring-fern_green/60"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-fern_green hover:bg-sage text-timberwolf"
        >
          {isLoading ? "Thinking..." : "Send"}
        </Button>
      </div>
    </div>
  );
};
