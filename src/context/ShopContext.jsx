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
    iduser:"37",
    deptuser: "URP",
    Discount:"Y",
    authName: "",
    authDesig: "",
    cliName: "",
    cliDesig: "",
}

// {
//   "QuotationNo": "Q-2026-000123",
//   "BranchId": 2,
//   "CreatedByUserId": 37,
//   "Attention": "attn",
//   "Designation": "designation",
//   "Company": "company",
//   "Location": "location",
//   "ProjectName": "project",
//   "QuotationDate": "2026-03-22",
//   "ValidUntil": "2026-03-29",
//   "DeliveryCharge": 123,
//   "InstallationCharge": 1234,
//   "LeadTime": "del lead time",
//   "Warranty": "warranty",
//   "PreparedBy": "sincerely name",
//   "PreparedByDesignation": "sincerely designation",
//   "DiscountMode": "Y",
//   "AuthorizedByName": "ilaw authorized",
//   "AuthorizedByDesignation": "ilaw designation authorized",
//   "ClientAuthorizedName": "client authorized",
//   "ClientAuthorizedDesignation": "client designation"
// }

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
function handleCustomerDetailsOnchange(field, value) {
  setQuoteDetails(prev => ({...prev, [field]: value}));
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