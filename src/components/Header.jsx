import SearchBar from "./SearchBar";
import { ShoppingBag,ChevronUp } from "lucide-react";
import logo from "../assets/logo.png";
import logo_circle from "../assets/logo circle.png";

import { useShop } from "../context/ShopContext";

import { useNavigate } from "react-router-dom";


export default function Header() {

    const navigate = useNavigate();


    const { view, setView, cartValue } = useShop();

    const handleCartClick = () => {
        if (view === "searching") {
            setView("");
        } else {
            navigate("/");
        }
    };

    return (
        <div className={`fixed  z-50 flex justify-between px-6 
                        transition-all duration-500 ease-in-out w-full 
                        ${view == "searching" ? "min-h-dvh bg-[#070707]/70 backdrop-blur-md" : "min-h-16 md:min-h-32 bg-[#f8f8f8]"}`}>

            <div className="max-h-16 md:max-h-32 flex items-center justify-start w-10 md:w-36 ">
                <img src={logo} alt="ILAW ATB" onClick={handleCartClick}
                    className={`h-[30px] transition-all duration-300 ease-in-out cursor-pointer hidden md:block`}
                />
                <img src={logo_circle} alt="ILAW ATB" onClick={handleCartClick}
                    className={`h-[30px] transition-all duration-300 ease-in-out cursor-pointer block md:hidden`}
                />
            </div>
            <div className={`min-h-16 md:min-h-32 flex items-center transition-all duration-500 ease-in-out 
                ${view == "searching" ? "w-[80%] md:w-1/2" : "w-1/2 md:w-2/6"}`}
            >
                <SearchBar></SearchBar>
            </div>
            <div className="max-h-16 md:max-h-32 flex items-center w-10 md:w-36 justify-end">
                <div className={`relative transition-all duration-300 ease-in-out`}
                    onClick={() => navigate(`/cart`)}
                >
                    <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-green-600 transition-colors duration-300 ease-in-out" />
                    <div className="absolute top-[-8px] right-[-8px] bg-red-500/90 h-4 w-4 rounded-full overflow-hidden text-[8px] text-white flex justify-center items-center">{cartValue.length}</div>
                </div>
            </div>
            <div className={`fixed bottom-4 -translate-x-1/2 left-1/2`}>
                <ChevronUp onClick={handleCartClick} className="text-white cursor-pointer" />
            </div>

        </div>
    );
}



