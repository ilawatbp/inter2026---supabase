import CartNav from "./CartNav";
import CartForm from "./CartForm";
import CartHistory from "./CartHistory";
import ServiceCartForm from "./ServiceCartForm";
import { useState, useRef, useEffect } from "react";


export default function CartPage() {
  const printRef = useRef(null);

  

  const [cartView, setCartView]= useState(()=>
      {
      const viewValue = localStorage.getItem("storageCartView") 
      if (viewValue == 'null'){
        return "form";
      }
      return viewValue;
    }
  );

  useEffect(() => {
    localStorage.setItem("storageCartView", cartView);
  }, [cartView]);



  return (
<div className="h-screen bg-gray-100 pb-20 text-sm overflow-auto scrollbar-hide">
        {/* NAVBAR */}
        <CartNav setCartView={setCartView} cartView={cartView} printRef={printRef}/>
        {/* MAIN CONTAINER */}

        {cartView == "form" && (
          <CartForm  printRef={printRef}/>
        ) }
        
        {cartView == "history" && (
          <CartHistory setCartView={setCartView} />
        )}

        {cartView == "serviceForm" && (
          <ServiceCartForm />
        )}


      </div>
  );
}
