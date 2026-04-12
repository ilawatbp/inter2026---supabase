import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const { profile, branch } = useAuth();

  const [view, setView] = useState("");
  const [quoteNum, setQuoteNum] = useState("-");
  const [quoteStatus, setQuoteStatus] = useState("draft");
  const [cartValue, setCartValue] = useState([]);
  const [quoteDetails, setQuoteDetails] = useState(null);

  const defaultRowsService = useMemo(
    () => [
      {
        id: crypto.randomUUID(),
        serviceType: "",
        amount: 0,
        scopes: [""],
      },
    ],
    []
  );
  

  const [rowsService, setRowsService] = useState(defaultRowsService);

  const cartStorageKey = profile?.id ? `cartValue_${profile.id}` : null;
  const quoteStorageKey = profile?.id ? `quoteDetails_${profile.id}` : null;
  const rowsServiceStorageKey = profile?.id ? `rowsService_${profile.id}` : null;

  const todaysDate = new Date().toISOString().split("T")[0];
  const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const defaultQuoteDetails = useMemo(
    () => ({
      Attn: "",
      Desig: "",
      Comp: "",
      Loc: "",
      Proj: "",
      frName: branch?.company_name,
      Qdate: todaysDate,
      validUntil: validUntil,
      ins_charge: "0",
      del_charge: "0",
      leadTime: "",
      warranty: "",
      prepby: profile?.fullname || "",
      designationOfUser: profile?.designation || "",
      iduser: profile?.id || "",
      deptuser: profile?.department || "",
      Discount: "Y",
      authName: "",
      authDesig: "",
      cliName: "",
      cliDesig: "",
    }),
    [todaysDate, validUntil, profile, branch]
  );

  // Load cart per logged-in user
  useEffect(() => {
    if (!cartStorageKey) {
      setCartValue([]);
      return;
    }

    try {
      const storedCart = localStorage.getItem(cartStorageKey);
      setCartValue(storedCart ? JSON.parse(storedCart) : []);
    } catch {
      setCartValue([]);
    }
  }, [cartStorageKey]);

  // Save cart per logged-in user
  useEffect(() => {
    if (!cartStorageKey) return;
    localStorage.setItem(cartStorageKey, JSON.stringify(cartValue));
  }, [cartValue, cartStorageKey]);

  // Load quote details per logged-in user
  useEffect(() => {
    if (!quoteStorageKey) {
      setQuoteDetails(defaultQuoteDetails);
      return;
    }

    try {
      const storedQuote = localStorage.getItem(quoteStorageKey);
      setQuoteDetails(storedQuote ? JSON.parse(storedQuote) : defaultQuoteDetails);
    } catch {
      setQuoteDetails(defaultQuoteDetails);
    }
  }, [quoteStorageKey, defaultQuoteDetails]);

  // Save quote details per logged-in user
  useEffect(() => {
    if (!quoteStorageKey || !quoteDetails) return;
    localStorage.setItem(quoteStorageKey, JSON.stringify(quoteDetails));
  }, [quoteDetails, quoteStorageKey]);

  // Load rowsService per logged-in user
  useEffect(() => {
    if (!rowsServiceStorageKey) {
      setRowsService(defaultRowsService);
      return;
    }

    try {
      const storedRowsService = localStorage.getItem(rowsServiceStorageKey);
      setRowsService(
        storedRowsService ? JSON.parse(storedRowsService) : defaultRowsService
      );
    } catch {
      setRowsService(defaultRowsService);
    }
  }, [rowsServiceStorageKey, defaultRowsService]);

  // Save rowsService per logged-in user
  useEffect(() => {
    if (!rowsServiceStorageKey) return;
    localStorage.setItem(rowsServiceStorageKey, JSON.stringify(rowsService));
  }, [rowsService, rowsServiceStorageKey]);

  function handleCustomerDetailsOnchange(field, value) {
    setQuoteDetails((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <ShopContext.Provider
      value={{
        view,
        setView,
        defaultQuoteDetails,
        cartValue,
        setCartValue,
        quoteDetails,
        setQuoteDetails,
        handleCustomerDetailsOnchange,
        quoteNum,
        setQuoteNum,
        quoteStatus,
        setQuoteStatus,
        rowsService,
        setRowsService,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider />");
  return ctx;
}