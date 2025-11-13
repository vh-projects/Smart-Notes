//  LandingPage.jsx

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brunswick_green to-hunter_green text-timberwolf">
      {/* Header */}
      <header className="flex justify-between items-center p-3 border-b border-fern_green">
        <div className="flex items-center space-x-2">
          <img src="pdf-logo.png" alt="SmartNotes" className="w-10 h-10 rounded-lg" />
          <h1 className="text-lg font-semibold text-timberwolf">SmartNotes</h1>
        </div>
        <Link to="/chat">
          <Button className="bg-fern_green hover:bg-sage text-timberwolf rounded-xl transition-colors">
            Launch App
          </Button>
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-col flex-1 items-center justify-center text-center px-6">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-timberwolf to-sage bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Chat with Your PDFs. Instantly.
        </motion.h1>

        <motion.p
          className="max-w-2xl text-timberwolf/80 text-lg mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, delay: 0.3 }}
        >
          Upload research papers, notes, or eBooks and ask questions naturally.
          SmartNotes extracts and reasons over your documents — powered by AI.
        </motion.p>

        <Link to="/chat">
          <Button className="bg-fern_green hover:bg-sage text-lg px-8 py-3 rounded-2xl text-timberwolf">
            Get Started →
          </Button>
        </Link>

        {/* Feature cards */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, delay: 0.6 }}
        >
          {[
            { title: "PDF Summaries", icon: "📄" },
            { title: "Instant Answers", icon: "⚡" },
            { title: "Smart Context", icon: "🧠" },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-brunswick_green border border-hunter_green hover:border-fern_green hover:bg-hunter_green transition"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-timberwolf">
                {item.title}
              </h3>
              <p className="text-timberwolf/70 text-sm mt-1">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
