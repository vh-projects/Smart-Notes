// Header.jsx

export const Header = () => (
  <header className="h-16 flex items-center justify-between px-6 border-b border-fern_green bg-hunter_green  shadow-md">
    <div className="flex items-center gap-2">
      <img
        src="pdf-logo.png"
        alt="SmartNotes Logo"
        className="w-10 h-10 object-contain rounded-lg"
      />
      <h1 className="text-lg m-0 font-semibold text-timberwolf leading-none">
        SmartNotes
      </h1>
    </div>
  </header>
);
