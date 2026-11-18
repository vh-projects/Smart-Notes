// src/components/Header.jsx
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const { pathname } = useLocation();

  const navLinks = [
    { label: "Home",         to: "/"              },
    { label: "How it works", to: "/how-it-works"  },
    { label: "Chat",         to: "/chat"          },
  ];

  return (
    <header
      style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      className="relative z-20 flex items-center justify-between px-10 py-6 border-b border-white/5"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 border border-[var(--blueshade)] rotate-45" />
          <span
            className="text-[var(--blueshade)] text-xs font-bold tracking-widest z-10"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            SN
          </span>
        </div>
        <span
          className="text-white/90 tracking-[0.12em] uppercase"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px" }}
        >
          SmartNotes
        </span>
      </Link>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map(({ label, to }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to}>
              <span
                className="text-xs tracking-widest uppercase transition-colors duration-200 relative group"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: active ? "var(--blueshade)" : "rgba(240,237,228,0.35)",
                }}
              >
                {label}
                {/* active underline */}
                <span
                  className="absolute -bottom-1 left-0 h-px transition-all duration-300"
                  style={{
                    background: "var(--blueshade)",
                    width: active ? "100%" : "0%",
                  }}
                />
              </span>
            </Link>
          );
        })}
      </nav>

      {/* CTA */}
      <Link to="/chat">
        <button className="group relative overflow-hidden px-6 py-2 border border-[var(--blueshade)] transition-all duration-300">
          <span className="absolute inset-0 bg-[var(--blueshade)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span
            className="relative text-[var(--golden)] text-xs tracking-widest uppercase transition-colors duration-300"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Open App →
          </span>
        </button>
      </Link>
    </header>
  );
};