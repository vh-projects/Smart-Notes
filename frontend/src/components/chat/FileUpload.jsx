
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FileUpload = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);

  // Function to handle the PDF upload with backend stream
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus("Starting upload...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/upload-stream", {
        method: "POST",
        body: formData,
      });

      // Open a stream reader to read backend-sent progress messages
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let fullBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fullBuffer += decoder.decode(value, { stream: true });

        // Process SSE-style messages
        const messages = fullBuffer.split("\n\n");
        fullBuffer = messages.pop(); // Keep partial

        for (const msg of messages) {
          if (msg.startsWith("data:")) {
            const data = JSON.parse(msg.replace("data:", "").trim());
            setStatus(data.status || "");

            // When doc_id arrives, upload is complete
            if (data.doc_id) {
              setDone(true);
              setUploading(false);
              setStatus("✅ Upload complete!");
              onFileUploaded({ 
                id: data.doc_id,
                doc_id: data.doc_id, // for chat window
                name: file.name });
            }
          }
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus("⚠️ Upload failed. Check backend connection.");
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-brunswick_green text-timberwolf relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-md p-8 rounded-xl bg-hunter_green border border-fern_green shadow-lg w-[90%] md:w-[450px]"
      >
        <div className="bg-gradient-to-b from-fern_green/30 to-transparent p-6 rounded-full mb-4">
          <Upload size={60} className="text-sage" />
        </div>

        <h2 className="text-2xl font-semibold mb-2 text-timberwolf">
          Upload a PDF to Start Chatting
        </h2>
        <p className="text-timberwolf/70 mb-6">
          Your document stays private and local.
        </p>

        <label className="relative cursor-pointer mb-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
          <div className="px-6 py-2 border border-fern_green/60 rounded-lg hover:border-fern_green transition text-sm text-timberwolf/80">
            {file ? file.name : "Choose a PDF"}
          </div>
        </label>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-fern_green hover:bg-sage w-full py-2 rounded-lg text-md font-medium text-timberwolf transition flex items-center justify-center"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : done ? (
            "✅ Uploaded"
          ) : (
            "Upload PDF"
          )}
        </Button>

        {/* Animated upload progress status */}
        <AnimatePresence>
          {uploading || status ? (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-6 text-sm text-timberwolf/80 bg-brunswick_green/40 border border-fern_green/40 rounded-lg px-4 py-2 w-full text-left"
            >
              {status}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

