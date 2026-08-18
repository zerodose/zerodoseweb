// "use client";

// import { Search, X } from "lucide-react";
// import { useEffect, useState } from "react";

// export default function SearchInput({
//   value = "",
//   onChange,
//   onSearch,
//   placeholder = "Search...",
// }) {
//   const [inputValue, setInputValue] = useState(value);
//   const [searched, setSearched] = useState(Boolean(value));

//   useEffect(() => {
//     setInputValue(value);
//     setSearched(Boolean(value));
//   }, [value]);

//   const handleChange = (event) => {
//     const newValue = event.target.value;

//     setInputValue(newValue);

//     // Typing ke waqt search execute nahi hogi
//     setSearched(false);
//   };

//   const handleSearch = () => {
//     const trimmedValue = inputValue.trim();

//     if (!trimmedValue) {
//       return;
//     }

//     setSearched(true);

//     onChange?.(trimmedValue);
//     onSearch?.(trimmedValue);
//   };

//   const handleClear = () => {
//     setInputValue("");
//     setSearched(false);

//     onChange?.("");
//     onSearch?.("");
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter") {
//       handleSearch();
//     }
//   };

//   return (
//     <div className="relative w-full lg:max-w-xs">
//       {/* Left Search Icon */}

//       <Search
//         size={18}
//         className="text-text-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
//       />

//       {/* Input */}

//       <input
//         type="text"
//         value={inputValue}
//         onChange={handleChange}
//         onKeyDown={handleKeyDown}
//         placeholder={placeholder}
//         className="border-border bg-background text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary-light h-10 w-full rounded-lg border pr-11 pl-10 text-sm transition outline-none focus:ring-2"
//       />

//       {/* Right Search / Clear Button */}

//       {inputValue.trim() && (
//         <button
//           type="button"
//           onClick={searched ? handleClear : handleSearch}
//           className="text-text-secondary hover:text-text absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center transition"
//           aria-label={searched ? "Clear search" : "Search"}
//         >
//           {searched ? <X size={18} /> : <Search size={18} />}
//         </button>
//       )}
//     </div>
//   );
// }

"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchInput({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search...",
}) {
  const [inputValue, setInputValue] = useState(value);
  const [searched, setSearched] = useState(Boolean(value));

  useEffect(() => {
    setInputValue(value);
    setSearched(Boolean(value));
  }, [value]);

  const handleChange = (event) => {
    const newValue = event.target.value;

    setInputValue(newValue);

    // Agar input manually blank kar diya
    if (!newValue.trim()) {
      setSearched(false);

      onChange?.("");
      onSearch?.("");

      return;
    }

    // Typing ke waqt search execute nahi hogi
    setSearched(false);
  };

  const handleSearch = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      // Empty search = tamam data
      setSearched(false);

      onChange?.("");
      onSearch?.("");

      return;
    }

    setSearched(true);

    onChange?.(trimmedValue);
    onSearch?.(trimmedValue);
  };

  const handleClear = () => {
    setInputValue("");
    setSearched(false);

    // Parent ko empty search bhejo
    onChange?.("");
    onSearch?.("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <Search
        size={18}
        className="text-text-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
      />

      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border-border bg-background text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary-light h-10 w-full rounded-lg border pr-11 pl-10 text-sm transition outline-none focus:ring-2"
      />

      {inputValue.trim() && (
        <button
          type="button"
          onClick={searched ? handleClear : handleSearch}
          className="text-text-secondary hover:text-text absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center transition"
          aria-label={searched ? "Clear search" : "Search"}
        >
          {searched ? <X size={18} /> : <Search size={18} />}
        </button>
      )}
    </div>
  );
}
