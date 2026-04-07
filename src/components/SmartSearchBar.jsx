import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Sparkles, Search } from 'lucide-react';

export default function SmartSearchBar() {

    const btnEnter = useRef();

    const [smartInput, setSmartInput] = useState("");
    const navigate = useNavigate();

    const handleSmartSearch = () => {
        const value = smartInput.trim();
        if (!value) return;

        navigate(`/query?smart=${encodeURIComponent(value)}`);
    };

    const [isSmartSearch, setIsSmartSearch] = useState(false);

    function handleSmartClick() {
        setIsSmartSearch((prev) => !prev)
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") btnEnter.current?.click();
    }

    return (
        <div className='flex gap-2 items-center justify-end'>
            <div className={`flex flex-row transition-all duration-300 ease-in-out 
                            ${isSmartSearch ? 'opacity-100 w-80 translate-x-0' : 'opacity-0 w-0 translate-x-2'}`}>
                <input
                    type="text"
                    className={`h-10 w-80 border border-black border-r-0 rounded-l-full bg-inherit px-3 outline-none bg-white
                                 ${isSmartSearch ? 'block' : 'hidden'}
                        `}
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    placeholder=""
                    onKeyDown={handleKeyDown}
                />
                <div className="h-10 w-10 rounded-r-full border-black border border-l-0  flex justify-center items-center bg-white"
                    onClick={handleSmartSearch}
                    ref={btnEnter}
                >
                    <Search className="h-5 w-5" />
                </div>
            </div>
            <div
                className="
                    inline-flex rounded-full p-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500
                    transition-all duration-300 ease-in-out
                    hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500
                    hover:shadow-[0_0_6px_rgba(168,85,247,0.4),0_0_12px_rgba(236,72,153,0.3),0_0_18px_rgba(34,211,238,0.3)]
                    cursor-pointer
  "
                onClick={handleSmartClick}
            >
                <div
                    className={`
                        flex flex-row items-center justify-center rounded-full bg-white
                        transition-all duration-300 ease-in-out overflow-hidden
                        ${isSmartSearch ? "h-8 w-8" : "h-8 w-32 px-3"}
    `}
                >
                    <span
                        className={`
        whitespace-nowrap text-sm
        transition-all duration-300 ease-in-out
        ${isSmartSearch
                                ? "opacity-0 max-w-0 -translate-x-2 mr-0"
                                : "opacity-100 max-w-[120px] translate-x-0 mr-2"}
      `}
                    >
                        ilaw assist
                    </span>

                    <Sparkles strokeWidth={1} className="h-4 w-4 shrink-0 cursor-pointer" />
                </div>
            </div>
        </div>
    );
}