// ChatPage.jsx

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { InsightPanel } from "@/components/chat/InsightPanel";
import { FileUpload } from "@/components/chat/FileUpload";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastInsight, setLastInsight] = useState(null); // { sources, evaluation }
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chats`);
        const data = await res.json();
        if (data?.chats) {
          const formatted = data.chats.map((c) => ({
            id: c._id,
            name: c.name || c.file_name || "Untitled",
            doc_id: c.doc_id,
          }));
          setChats(formatted);
          if (formatted.length > 0) setActiveChat(formatted[0].doc_id);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleFileUploaded = (chat) => {
    setChats((prev) => [...prev, chat]);
    setActiveChat(chat.doc_id);
    setShowUploader(false);
  };

  const handleAddNewChat = () => {
    setShowUploader(true);
    setActiveChat(null);
  };

  const handleDeleteChat = async (id) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;
    if (!window.confirm(`Delete "${chat.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChat === chat.doc_id) setActiveChat(null);
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen"
        style={{ background: "#0a0d06" }}>
        <span className="text-[10px] tracking-[0.3em] uppercase animate-pulse"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(198,241,53,0.5)" }}>
          Loading...
        </span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        .grid-bg {
          background-image:
            linear-gradient(rgba(198,241,53,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(198,241,53,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(198,241,53,0.2); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(198,241,53,0.4); }
      `}</style>

      <div className="h-screen flex grid-bg overflow-hidden"
        style={{ background: "#0a0d06", color: "#f0ede4" }}>

        {/* LEFT — Sidebar */}
        <Sidebar
          chats={chats}
          activeChat={chats.find((c) => c.doc_id === activeChat)?.id}
          setActiveChat={(id) => {
            const selected = chats.find((c) => c.id === id);
            if (selected) { setActiveChat(selected.doc_id); setShowUploader(false); }
          }}
          onAddChat={handleAddNewChat}
          onDeleteChat={handleDeleteChat}
        />

        {/* CENTER — Chat or Upload */}
        <div className="flex-1 flex flex-col border-x"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {showUploader || !activeChat ? (
            <FileUpload onFileUploaded={handleFileUploaded} />
          ) : (
            <ChatWindow chatId={activeChat} onInsightUpdate={setLastInsight} />
          )}
        </div>

        {/* RIGHT — Insight Panel */}
        <InsightPanel insight={lastInsight} />
      </div>
    </>
  );
}
