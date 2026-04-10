// // Header.jsx

// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";

// export const Header = () => (
//   <header className="h-16 flex items-center justify-between px-6 border-b border-fern_green bg-hunter_green  shadow-md">
//     <div className="flex items-center gap-2">
//       <img
//         src="pdf-logo.png"
//         alt="SmartNotes Logo"
//         className="w-10 h-10 object-contain rounded-lg"
//       />
//       <h1 className="text-lg m-0 font-semibold text-timberwolf leading-none">
//         SmartNotes
//       </h1>

//       <Link to="/chat">
//         <Button className="bg-fern_green hover:bg-sage text-timberwolf rounded-xl transition-colors shadow-sm hover:shadow-md">
//           Launch App
//         </Button>
//       </Link>
//     </div>
//   </header>
// );










// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";

// export const Header = () => {
//   return (
//     <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 bg-transparent backdrop-blur-md">

//       {/* Left */}
//       <div className="flex items-center gap-3">
//         <img
//           src="pdf-logo.png"
//           alt="SmartNotes Logo"
//           className="w-9 h-9 rounded-lg"
//         />
//         <span className="text-lg font-semibold text-timberwolf">
//           SmartNotes
//         </span>
//       </div>

//       {/* Right */}
//       <div className="flex items-center gap-4">
//         <Link to="/chat">
//           <Button className="bg-fern_green hover:bg-sage text-timberwolf px-5">
//             Open App
//           </Button>
//         </Link>
//       </div>

//     </header>
//   );
// };




import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header
      style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      className="relative z-20 flex items-center justify-between px-10 py-6 border-b border-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 border border-[var(--blueshade)] rotate-45" />
          <span className="text-[var(--blueshade)] text-xs font-bold tracking-widest z-10"
            style={{ fontFamily: "'Space Mono', monospace" }}>SN</span>
        </div>
        <span className="text-white/90 text-base tracking-[0.12em] uppercase"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px" }}>
          SmartNotes
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        {["Features", "How it works", "Pricing"].map((item) => (
          <span key={item}
            className="text-white/40 hover:text-white/80 transition-colors cursor-pointer text-xs tracking-widest uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            {item}
          </span>
        ))}
      </nav>

      <Link to="/chat">
        <button className="group relative overflow-hidden px-6 py-2 border border-[var(--blueshade)] hover:border-[var(--blueshade)] transition-all duration-300">

          <span className="absolute inset-0 bg-[var(--blueshade)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative text-[var(--golden)] group-hover:text-[var(--golden)] text-xs tracking-widest uppercase transition-colors duration-300"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            Open App →
          </span>
        </button>
      </Link>
    </header>
  );
};
