
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
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
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Error querying:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-gray-200 overflow-hidden">
      {/* Scrollable chat area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-[#2f3745] scrollbar-track-transparent">
        {messages.length === 0 && !isLoading && (
          <p className="text-gray-500 text-center mt-20 text-lg">
            Upload a PDF and start chatting ✨
          </p>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-5 rounded-2xl ${
              msg.role === "user"
                ? "bg-[#1e2b22] text-[#d7f8d7] self-end ml-auto max-w-2xl"
                : "bg-[#17191f] text-gray-100 mx-auto w-full max-w-5xl prose prose-invert prose-headings:text-indigo-400 prose-strong:text-indigo-300 prose-code:text-green-300 prose-ul:list-disc prose-pre:bg-[#111318]"
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.text}
            </ReactMarkdown>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-center">
            <motion.div
              className="bg-[#17191f] text-gray-400 px-6 py-4 rounded-2xl shadow animate-pulse"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Generating response...
            </motion.div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed input bar */}
      <div className="border-t border-[#2a2f38] bg-[#111318] p-4 flex items-center space-x-3">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 resize-none bg-[#1b1f27] text-gray-100 border-none focus:ring-indigo-500"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2"
        >
          {isLoading ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
};













// import { useState, useRef, useEffect } from "react";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeHighlight from "rehype-highlight";

// export const ChatWindow = ({ chatId }) => {
//   const [messages, setMessages] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Auto-scroll to bottom
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async () => {
//     if (!question.trim()) return;

//     const userMsg = { role: "user", text: question };
//     setMessages((prev) => [...prev, userMsg]);
//     setQuestion("");
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("doc_id", chatId);
//       formData.append("question", question);

//       const res = await fetch("http://localhost:8000/api/query", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       const aiMsg = { role: "assistant", text: data.answer };
//       setMessages((prev) => [...prev, aiMsg]);
//     } catch (err) {
//       console.error("Error querying:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex-1 flex flex-col bg-[#0f1117] text-gray-200 overflow-hidden">
//       {/* Scrollable Chat Area */}
//       <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-thin scrollbar-thumb-[#2f3745] scrollbar-track-transparent">
//         {messages.length === 0 && !isLoading && (
//           <p className="text-gray-500 text-center mt-20 text-lg">
//             Upload a PDF and start chatting ✨
//           </p>
//         )}

//         {messages.map((msg, idx) => (
//           <motion.div
//             key={idx}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className={`p-5 rounded-2xl ${
//               msg.role === "user"
//                 ? "bg-[#1e2b22] text-[#d7f8d7] self-end ml-auto max-w-2xl"
//                 : "bg-[#181a22] text-gray-100 mx-auto w-full max-w-5xl prose prose-invert prose-pre:bg-[#0f1117] prose-headings:text-indigo-400 prose-strong:text-indigo-300 prose-code:text-green-300 prose-ul:list-disc prose-li:marker:text-indigo-400"
//             }`}
//           >
//             {msg.role === "assistant" ? (
//               <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 rehypePlugins={[rehypeHighlight]}
//               >
//                 {msg.text}
//               </ReactMarkdown>
//             ) : (
//               <div>{msg.text}</div>
//             )}
//           </motion.div>
//         ))}

//         {isLoading && (
//           <div className="flex justify-center">
//             <motion.div
//               className="bg-[#17191f] text-gray-400 px-6 py-4 rounded-2xl shadow animate-pulse"
//               initial={{ opacity: 0.6 }}
//               animate={{ opacity: 1 }}
//               transition={{ repeat: Infinity, duration: 1 }}
//             >
//               Generating response...
//             </motion.div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Area */}
//       <div className="border-t border-[#2a2f38] bg-[#111318] p-4 flex items-center space-x-3">
//         <Textarea
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           placeholder="Ask a question..."
//           className="flex-1 resize-none bg-[#1b1f27] text-gray-100 border-none focus:ring-indigo-500"
//           rows={1}
//         />
//         <Button
//           onClick={handleSend}
//           disabled={isLoading}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2"
//         >
//           {isLoading ? "..." : "Send"}
//         </Button>
//       </div>
//     </div>
//   );
// };
