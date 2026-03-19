import CartNav from "./CartNav";
import CartForm from "./CartForm";
import CartHistory from "./CartHistory";
import { useState, useRef } from "react";


export default function CartPage() {
  const printRef = useRef(null);
  const [cartView, setCartView]= useState("form");

  return (
<div className="h-screen bg-gray-100 pb-20 text-sm overflow-auto scrollbar-hide">
        {/* NAVBAR */}
        <CartNav setCartView={setCartView} cartView={cartView} printRef={printRef}/>
        {/* MAIN CONTAINER */}

        {cartView == "form" ? (
          <CartForm  printRef={printRef}/>
        ) : (
          <CartHistory setCartView={setCartView} />
        )}


      </div>
  );
}
