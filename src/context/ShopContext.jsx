import { createContext, useContext, useState, useEffect} from "react"; 
const ShopContext = createContext();

export function ShopProvider({ children }) {

const [view, setView] = useState("");

const [quoteNum, setQuoteNum] = useState("-");

const [quoteStatus, setQuoteStatus] = useState("draft");

    const todaysDate = new Date(Date.now() + 0 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];


    const validUntil = new Date((Date.now() + 7 * 24 * 60 * 60 * 1000))
    .toISOString()
    .split("T")[0];


const [cartValue, setCartValue] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("cartValue")) || [];
  } catch {
    return [];
  }
});
// Persist cart
useEffect(() => {
  localStorage.setItem("cartValue", JSON.stringify(cartValue));
}, [cartValue]);

const defaultQuoteDetails = {
  qinfo : {
    Attn: "",
    Desig: "",
    Comp: "",
    Loc: "",
    Proj: "",
    frName: "",
    Qdate: todaysDate,
    validUntil: validUntil,
    ins_charge: "0",
    del_charge: "0",
    leadTime: "",
    warranty: "",
    prepby: "",
    designationOfUser: "",
  },
  qn : {
    iduser:"37",
    deptuser: "URP",
    Discount:"Y",
    authName: "",
    authDesig: "",
    cliName: "",
    cliDesig: "",
    ilawBusNameSign: "-",
    cliBusNameSign:"-"
  }
}

const [quoteDetails, setQuoteDetails] = useState(() => {
  try {
    const stored = localStorage.getItem("quoteDetails");
    return stored ? JSON.parse(stored) : defaultQuoteDetails;
  } catch {
    return defaultQuoteDetails;
  }
});


// Persist quote details
useEffect(() => {
  localStorage.setItem("quoteDetails", JSON.stringify(quoteDetails));
}, [quoteDetails]);

// details saves to state when input values for customer detail changes
function handleCustomerDetailsOnchange(section, field, value) {
  setQuoteDetails(prev => ({ ...prev, [section]:{...prev[section], [field]: value} }));
}


return (
  <ShopContext.Provider value={{view, setView, defaultQuoteDetails, cartValue, setCartValue,quoteDetails, setQuoteDetails, handleCustomerDetailsOnchange, quoteNum, setQuoteNum, quoteStatus, setQuoteStatus}}>{children}</ShopContext.Provider>
);
}


export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider />");
  return ctx;
}