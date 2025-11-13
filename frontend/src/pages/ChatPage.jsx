// ChatPage.jsx

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Header } from "@/components/Header";
import { FileUpload } from "@/components/chat/FileUpload";

export default function ChatPage() {
  const [chats, setChats] = useState([]); // list of chats (from Mongo)
  const [activeChat, setActiveChat] = useState(null); // current chat (doc_id)
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch existing chats from MongoDB when page loads
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/chats");
        const data = await res.json();

        if (data?.chats) {
          const formatted = data.chats.map((c) => ({
            id: c._id, // Mongo doc _id
            name: c.name || c.file_name || "Untitled Chat",
            doc_id: c.doc_id, // used in queries
          }));
          setChats(formatted);
          if (formatted.length > 0) setActiveChat(formatted[0].doc_id);
        }
      } catch (err) {
        console.error("❌ Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  // ✅ Called when a new PDF successfully uploads
  const handleFileUploaded = (chat) => {
    // chat = { id, name, doc_id } returned from FileUpload component
    setChats((prev) => [...prev, chat]);
    setActiveChat(chat.doc_id);
    setShowUploader(false);
  };

  // ✅ Add new chat (open file uploader)
  const handleAddNewChat = () => {
    setShowUploader(true);
    setActiveChat(null);
  };

  // ✅ Delete chat (Mongo + Qdrant cleanup)
  const handleDeleteChat = async (id) => {
    const chat = chats.find((c) => c.id === id);
    if (!chat) return;

    if (!window.confirm(`Delete chat "${chat.name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:8000/api/chat/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());

      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChat === chat.doc_id) setActiveChat(null);
    } catch (err) {
      console.error("❌ Error deleting chat:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-timberwolf/60">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-brunswick_green text-timberwolf">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          chats={chats}
          activeChat={chats.find((c) => c.doc_id === activeChat)?.id}
          setActiveChat={(id) => {
            const selected = chats.find((c) => c.id === id);
            if (selected) {
              setActiveChat(selected.doc_id);
              setShowUploader(false);
            }
          }}
          onAddChat={handleAddNewChat}
          onDeleteChat={handleDeleteChat}
        />

        <div className="flex-1 flex flex-col bg-hunter_green">
          {showUploader ? (
            <FileUpload onFileUploaded={handleFileUploaded} />
          ) : activeChat ? (
            <ChatWindow chatId={activeChat} />
          ) : (
            <FileUpload onFileUploaded={handleFileUploaded} />
          )}
        </div>
      </div>
    </div>
  );
}