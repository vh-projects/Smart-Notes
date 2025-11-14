// //  LandingPage.jsx


import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa6";

export default function LandingPage() {
  const fade = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" },
    }),
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-brunswick_green to-hunter_green text-timberwolf">


      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-fern_green/40 backdrop-blur-md bg-brunswick_green/20">
        <div className="flex items-center space-x-2">
          <img src="pdf-logo.png" alt="SmartNotes" className="w-10 h-10 rounded-lg" />
          <h1 className="text-xl font-semibold text-timberwolf tracking-wide">
            SmartNotes
          </h1>
        </div>
        <Link to="/chat">
          <Button className="bg-fern_green hover:bg-sage text-timberwolf rounded-xl transition-colors shadow-sm hover:shadow-md">
            Launch App
          </Button>
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-col flex-1 items-center justify-center text-center px-6 relative">

        <motion.h1
          className="text-5xl mt-4 md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-timberwolf to-sage bg-clip-text text-transparent drop-shadow-sm"
          variants={fade}
          initial="hidden"
          animate="show"
        >
          Chat with Your PDFs. Instantly.
        </motion.h1>

        <motion.p
          className="max-w-2xl text-timberwolf/80 text-lg mb-10 leading-relaxed"
          variants={fade}
          initial="hidden"
          animate="show"
          custom={2}
        >
          Upload research papers, notes, or eBooks and ask questions naturally.
          SmartNotes extracts and reasons over your documents — powered by AI.
        </motion.p>

        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          custom={3}
        >
          <Link to="/chat">
            <Button className="bg-fern_green hover:bg-sage text-lg px-8 py-3 rounded-2xl text-timberwolf shadow-md hover:shadow-lg transition transform hover:scale-[1.03]">
              Get Started →
            </Button>
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          {[ 
            {
              title: "PDF Summaries",
              icon: "📄",
              text: "Generate clean summaries of long PDFs in a click."
            },
            {
              title: "Instant Answers",
              icon: "⚡",
              text: "Ask questions naturally and get real-time responses."
            },
            {
              title: "Smart Context",
              icon: "🧠",
              text: "AI remembers your chat and keeps the conversation flowing."
            }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="p-6 rounded-2xl bg-brunswick_green/50 backdrop-blur-lg border border-hunter_green hover:border-fern_green transition relative overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1"
              variants={fade}
              custom={i + 4}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-timberwolf">
                {item.title}
              </h3>
              <p className="text-timberwolf/70 text-sm mt-2 leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-fern_green/30 bg-brunswick_green/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-timberwolf/70 text-sm">

          <p className="text-center md:text-left">
            © {new Date().getFullYear()} <span className="text-timberwolf font-semibold">SmartNotes</span>. Built with ♥ using AI.
          </p>

          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="https://github.com/vh-projects/Smart-Notes"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fern_green transition flex items-center space-x-2"
            >
              <FaGithub className="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}
