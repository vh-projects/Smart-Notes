// Sidebar.jsx

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export const Sidebar = ({
  chats,
  activeChat,
  setActiveChat,
  onAddChat,
  onDeleteChat,
}) => {
  const handleDelete = (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDeleteChat(id); // ✅ Call parent function only
    }
  };

  return (
    <div className="w-72 bg-brunswick_green border-r border-fern_green flex flex-col">
      {/* Header Section */}
      <div className="p-4 border-b border-fern_green flex justify-between items-center">
        <h2 className="font-semibold text-timberwolf text-lg">My Chats</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={onAddChat}
          className="rounded-lg bg-brunswick_green text-timberwolf hover:bg-fern_green hover:text-timberwolf transition-colors"
        >
          <Plus size={18} />
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {chats.length === 0 ? (
          <p className="text-timberwolf/70 text-sm text-center mt-10">
            No chats yet. Upload a PDF to start.
          </p>
        ) : (
          <ul className="p-2 space-y-2">
            {chats.map((chat) => (
              <motion.li
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`group relative px-3 py-2 rounded-lg cursor-pointer transition select-none ${
                  activeChat === chat.id
                    ? "bg-fern_green text-timberwolf"
                    : "hover:bg-hunter_green text-timberwolf/90"
                }`}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="pr-8 overflow-hidden">
                  <span className="block truncate">{chat.name}</span>
                </div>

                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={(e) => handleDelete(e, chat.id, chat.name)}
                >
                  <Trash2
                    size={16}
                    className="text-sage opacity-70 hover:opacity-100 hover:text-timberwolf transition-opacity duration-150"
                  />
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
};
