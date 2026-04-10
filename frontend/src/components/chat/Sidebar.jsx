// // Sidebar.jsx

// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Plus, Trash2 } from "lucide-react";
// import { motion } from "framer-motion";

// export const Sidebar = ({
//   chats,
//   activeChat,
//   setActiveChat,
//   onAddChat,
//   onDeleteChat,
// }) => {
//   const handleDelete = (e, id, name) => {
//     e.stopPropagation();
//     if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
//       onDeleteChat(id); // ✅ Call parent function only
//     }
//   };

//   return (
//     <div className="w-72 bg-brunswick_green border-r border-fern_green flex flex-col">
//       {/* Header Section */}
//       <div className="p-4 border-b border-fern_green flex justify-between items-center">
//         <h2 className="font-semibold text-timberwolf text-lg">My Chats</h2>
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={onAddChat}
//           className="rounded-lg bg-brunswick_green text-timberwolf hover:bg-fern_green hover:text-timberwolf transition-colors"
//         >
//           <Plus size={18} />
//         </Button>
//       </div>

//       {/* Chat List */}
//       <ScrollArea className="flex-1">
//         {chats.length === 0 ? (
//           <p className="text-timberwolf/70 text-sm text-center mt-10">
//             No chats yet. Upload a PDF to start.
//           </p>
//         ) : (
//           <ul className="p-2 space-y-2">
//             {chats.map((chat) => (
//               <motion.li
//                 key={chat.id}
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.2 }}
//                 className={`group relative px-3 py-2 rounded-lg cursor-pointer transition select-none ${
//                   activeChat === chat.id
//                     ? "bg-fern_green text-timberwolf"
//                     : "hover:bg-hunter_green text-timberwolf/90"
//                 }`}
//                 onClick={() => setActiveChat(chat.id)}
//               >
//                 <div className="pr-8 overflow-hidden">
//                   <span className="block truncate">{chat.name}</span>
//                 </div>

//                 <div
//                   className="absolute right-3 top-1/2 -translate-y-1/2"
//                   onClick={(e) => handleDelete(e, chat.id, chat.name)}
//                 >
//                   <Trash2
//                     size={16}
//                     className="text-sage opacity-70 hover:opacity-100 hover:text-timberwolf transition-opacity duration-150"
//                   />
//                 </div>
//               </motion.li>
//             ))}
//           </ul>
//         )}
//       </ScrollArea>
//     </div>
//   );
// };
















import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";

export const Sidebar = ({ chats, activeChat, setActiveChat, onAddChat, onDeleteChat }) => {
  return (
    <div className="w-64 flex flex-col flex-shrink-0 border-r"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>

      {/* Top brand strip */}
      <div className="px-5 py-5 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase mb-1"
            style={{ fontFamily: "'Space Mono', monospace", color: "rgba(198,241,53,0.5)" }}>
            SmartNotes
          </p>
          <p className="text-[11px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.3)" }}>
            My Documents
          </p>
        </div>

        <button onClick={onAddChat}
          className="w-7 h-7 flex items-center justify-center border transition-all duration-200 hover:border-[#c6f135]/60 hover:bg-[#c6f135]/5 group"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
          title="New upload">
          <Plus size={13} style={{ color: "rgba(240,237,228,0.4)" }}
            className="group-hover:text-[#c6f135] transition-colors" />
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-1">
        <AnimatePresence>
          {chats.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center mt-12 text-[10px] tracking-widest leading-loose"
              style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.2)" }}>
              No documents yet.<br />Upload a PDF to start.
            </motion.p>
          ) : (
            chats.map((chat, i) => (
              <motion.div key={chat.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => setActiveChat(chat.id)}
                className="group relative px-3 py-3 cursor-pointer transition-all duration-200 rounded-sm"
                style={{
                  background: activeChat === chat.id
                    ? "rgba(198,241,53,0.07)" : "transparent",
                  borderLeft: activeChat === chat.id
                    ? "2px solid rgba(198,241,53,0.6)" : "2px solid transparent",
                }}>

                {/* doc icon */}
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex-shrink-0 w-4 h-5 relative">
                    <div className="w-full h-full border"
                      style={{ borderColor: activeChat === chat.id ? "rgba(198,241,53,0.4)" : "rgba(255,255,255,0.15)" }} />
                    <div className="absolute top-0 right-0 w-1.5 h-1.5"
                      style={{ borderLeft: "1px solid rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(0,0,0,0.5)", background: activeChat === chat.id ? "rgba(198,241,53,0.3)" : "rgba(255,255,255,0.1)" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[11px] leading-tight"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        color: activeChat === chat.id ? "#c6f135" : "rgba(240,237,228,0.55)",
                      }}>
                      {chat.name}
                    </p>
                  </div>
                </div>

                {/* delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Delete">
                  <Trash2 size={11} style={{ color: "rgba(240,237,228,0.3)" }}
                    className="hover:text-red-400 transition-colors" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Bottom label */}
      <div className="px-5 py-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-[9px] tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Space Mono', monospace", color: "rgba(240,237,228,0.12)" }}>
          ✦ Document Intelligence
        </p>
      </div>
    </div>
  );
};
