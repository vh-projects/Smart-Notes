/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

 
      fontFamily: {
        darker: ["Darker Grotesque", "sans-serif"], // bold expressive
        space: ["Space Grotesk", "sans-serif"],        // clean modern
        inter: ["Inter", "sans-serif"],
      },

      colors: {
        timberwolf: "#dad7cdff",
        sage: "#a3b18aff",          
        fern_green: "#588157ff",
        hunter_green: "#3a5a40ff",
        brunswick_green: "#344e41ff", 
      },


      // colors: {
      //   background: "#0D0F0E",
      //   card: "rgba(22, 24, 23, 0.6)",
      //   accent: "#A3B18A",
      //   accentDark: "#6B9080",
      //   text: "#E6EAE7",
      //   subtle: "#A0A5A2",
      //   graphite: "#2E2E2E",   // deep neutral gray
      //   platinum: "#D3D3D3",   // soft light gray
      //   silver: "#AFAFAF",     // mid-tone gray
      // },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },

    },
  },
  plugins: [],
};
