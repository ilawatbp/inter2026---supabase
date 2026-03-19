import { Search } from "lucide-react";
import { useRef } from "react";

import { useShop } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {

  const { setView, view } = useShop();

  const inputRef = useRef(null);
  const btnRef = useRef(null);

  const navigate = useNavigate();

  function handleKeyDown(e) {
    if (e.key === "Enter") btnRef.current?.click();
  }

  function submitSearch(){
    const value = inputRef.current?.value ?? "";
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    setView("")
    navigate(`/query?q=${encodeURIComponent(trimmedValue)}`);
  }

  return (
    <div className={`flex justify-center rounded-2xl shadow-md w-full ${view == "searching" ? "h-12" : "h-10"}`}>
      <input
        type="text"
        ref={inputRef}
        className="bg-white rounded-l-2xl focus:outline-none px-4 flex-1 min-w-1"
        onClick={() => setView("searching")}
        onKeyDown={handleKeyDown}
      />

      <button
        ref={btnRef}
        className="flex items-center justify-center bg-[#3cb54c] text-white w-12 rounded-r-2xl"
        onClick={submitSearch}
      >
        <Search />
      </button>
    </div>
  );
}