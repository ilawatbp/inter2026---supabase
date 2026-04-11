import { House, Save, BrushCleaning, Printer } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { sileo } from "sileo";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function CartNav({ setCartView, cartView, printRef }) {
  const navigate = useNavigate();
  const { profile, branch } = useAuth();

  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openClearModal, setOpenClearModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const discountValue = useRef();

  const {
    cartValue,
    quoteDetails,
    setCartValue,
    setQuoteDetails,
    defaultQuoteDetails,
    setQuoteNum,
    quoteNum,
    quoteStatus,
    setQuoteStatus,
    rowsService,
    setRowsService,
  } = useShop();

  const [isSaving, setIsSaving] = useState(false);

  function getDefaultServiceRows() {
    return [
      {
        id: crypto.randomUUID(),
        serviceType: "",
        amount: 0,
        scopes: [""],
      },
    ];
  }

  function buildQuotationHeaderPayload({ quoteDetails }) {
    const q = quoteDetails ?? {};

    return {
      p_quotation_date: q.Qdate,
      p_valid_until: q.validUntil,

      p_attention: q.Attn || null,
      p_designation: q.Desig || null,
      p_company: q.Comp || null,
      p_location: q.Loc || null,
      p_project_name: q.Proj || null,
      p_from_name: q.frName || null,
      p_subject_line: "Quotation",

      p_delivery_charge: Number(q.del_charge || 0),
      p_installation_charge: Number(q.ins_charge || 0),

      p_lead_time: q.leadTime || null,
      p_warranty: q.warranty || null,
      p_prepared_by: q.prepby || null,
      p_prepared_by_designation: q.designationOfUser || null,
      p_discount_mode: q.Discount || null,
      p_authorized_by_name: q.authName || null,
      p_authorized_by_designation: q.authDesig || null,
      p_client_authorized_name: q.cliName || null,
      p_client_authorized_designation: q.cliDesig || null,
      p_status: "locked",
      p_remarks: null,
    };
  }

  function buildQuotationItemsPayload({ cartValue, quotationId }) {
    return cartValue.map((item, index) => ({
      quotation_id: quotationId,
      line_no: index + 1,

      item_code: item.itemcode ?? null,
      item_description: item.itemname ?? null,
      area: item.Area ?? null,
      notes: item.Rem ?? null,
      quantity: Number(item.Quantity ?? 0),
      unit_price: Number(item.SRP ?? 0),
      discount_percent: Number(item.Discount ?? 0),
      line_total: Number(item.LineTotal ?? 0),
    }));
  }

  function buildServiceQuotationHeaderPayload({ quoteDetails }) {
    const q = quoteDetails ?? {};

    return {
      p_branch_code: branch?.branch_code,
      p_created_by_user_id: profile?.id,
      p_quotation_date: q.Qdate,
      p_valid_until: q.validUntil,

      p_attention: q.Attn || null,
      p_designation: q.Desig || null,
      p_company: q.Comp || null,
      p_location: q.Loc || null,
      p_project_name: q.Proj || null,
      p_from_name: q.frName || null,
      p_subject_line: "Service Quotation",

      p_lead_time: q.leadTime || null,
      p_warranty: q.warranty || null,
      p_prepared_by: q.prepby || null,
      p_prepared_by_designation: q.designationOfUser || null,
      p_authorized_by_name: q.authName || null,
      p_authorized_by_designation: q.authDesig || null,
      p_client_authorized_name: q.cliName || null,
      p_client_authorized_designation: q.cliDesig || null,
      p_status: "locked",
      p_remarks: null,
    };
  }

  function buildServiceQuotationLinesPayload({ rowsService, quotationId }) {
    const cleanedRowsService = rowsService.filter((row) => {
      const hasServiceType = row.serviceType?.trim();
      const hasAmount = Number(row.amount) > 0;
      const hasScopes = row.scopes?.some((scope) => scope.trim() !== "");

      return hasServiceType || hasAmount || hasScopes;
    });

    return cleanedRowsService.map((row, index) => ({
      quotation_id: quotationId,
      line_no: index + 1,
      service_type: row.serviceType || null,
      amount: Number(row.amount) || 0,
      scopes: (row.scopes || []).filter((scope) => scope.trim() !== ""),
    }));
  }

  async function submitQuote() {
    const headerPayload = buildQuotationHeaderPayload({
      quoteDetails,
    });

    try {
      const { data: header, error: headerError } = await supabase.rpc(
        "create_quotation_header_for_current_user",
        headerPayload,
      );

      if (headerError) {
        throw new Error(
          headerError.message || "Failed to save quotation header",
        );
      }

      const itemsPayload = buildQuotationItemsPayload({
        cartValue,
        quotationId: header.id,
      });

      if (itemsPayload.length > 0) {
        const { error: itemsError } = await supabase
          .from("quotation_items")
          .insert(itemsPayload);

        if (itemsError) {
          throw new Error(
            itemsError.message || "Failed to save quotation items",
          );
        }
      }

      setQuoteStatus("locked");
      setOpenSaveModal(false);
      setQuoteNum(header.quotation_no);

      sileo.success({
        title: "Saved",
        description: `${header.quotation_no} successfully added`,
        fill: "#f3f4f6",
        styles: {
          description: "!text-black",
        },
      });

      return header;
    } catch (err) {
      sileo.error({
        title: "ERROR IN SAVING",
        description: err.message,
        fill: "#171717",
        styles: {
          description: "!text-white",
        },
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function submitServiceQuote() {
    const headerPayload = buildServiceQuotationHeaderPayload({
      quoteDetails,
    });

    try {
      const { data: header, error: headerError } = await supabase.rpc(
        "create_service_quotation_header",
        headerPayload,
      );

      if (headerError) {
        throw new Error(
          headerError.message || "Failed to save service quotation header",
        );
      }

      const linesPayload = buildServiceQuotationLinesPayload({
        rowsService,
        quotationId: header.id,
      });

      if (linesPayload.length > 0) {
        const { error: linesError } = await supabase
          .from("service_quotation_lines")
          .insert(linesPayload);

        if (linesError) {
          throw new Error(
            linesError.message || "Failed to save service quotation lines",
          );
        }
      }

      setQuoteStatus("locked");
      setOpenSaveModal(false);
      setQuoteNum(header.quotation_no);

      sileo.success({
        title: "Saved",
        description: `${header.quotation_no} successfully added`,
        fill: "#f3f4f6",
        styles: {
          description: "!text-black",
        },
      });

      return header;
    } catch (err) {
      sileo.error({
        title: "ERROR IN SAVING",
        description: err.message,
        fill: "#171717",
        styles: {
          description: "!text-white",
        },
      });
    } finally {
      setIsSaving(false);
    }
  }

  function clearAll() {
    setCartValue([]);
    setQuoteDetails(structuredClone(defaultQuoteDetails));
    setRowsService(getDefaultServiceRows());
    setQuoteNum("-");
    setQuoteStatus("draft");

    if (profile?.id) {
      localStorage.setItem(`cartValue_${profile.id}`, JSON.stringify([]));
      localStorage.setItem(
        `quoteDetails_${profile.id}`,
        JSON.stringify(defaultQuoteDetails),
      );
      localStorage.setItem(
        `rowsService_${profile.id}`,
        JSON.stringify(getDefaultServiceRows()),
      );
    }

    window.location.reload();
  }

  function clearServiceOnly() {
    setRowsService(getDefaultServiceRows());
    setQuoteNum("-");
    setQuoteStatus("draft");

    if (profile?.id) {
      localStorage.setItem(
        `rowsService_${profile.id}`,
        JSON.stringify(getDefaultServiceRows()),
      );
    }
  }

  const handleOpenDiscout = () => {
    setOpenDiscountModal(true);
  };

  function handleDiscount() {
    setCartValue((prev) =>
      prev.map((item) => ({
        ...item,
        Discount: discountValue.current.value,
      })),
    );
    setOpenDiscountModal(false);
  }

  function handleSave() {
    if (cartView === "form") {
      if (cartValue.length === 0) {
        setOpenErrorModal(true);
        setErrorMsg("Please Add Atleast one Item");
        return;
      }

      for (const item of cartValue) {
        if (item.Quantity == 0) {
          setOpenErrorModal(true);
          setErrorMsg("all items must be atles one quant");
          return;
        }
      }

      if (quoteDetails.Attn === "" || quoteDetails.Comp === "") {
        setOpenErrorModal(true);
        setErrorMsg("Please Complete the Customer Details");
        return;
      }

      setOpenSaveModal(true);
      return;
    }

    if (cartView === "serviceForm") {
      const cleanedRowsService = rowsService.filter((row) => {
        const hasServiceType = row.serviceType?.trim();
        const hasAmount = Number(row.amount) > 0;
        const hasScopes = row.scopes?.some((scope) => scope.trim() !== "");

        return hasServiceType || hasAmount || hasScopes;
      });

      if (cleanedRowsService.length === 0) {
        setOpenErrorModal(true);
        setErrorMsg("Please add at least one service row");
        return;
      }

      if (quoteDetails.Attn === "" || quoteDetails.Comp === "") {
        setOpenErrorModal(true);
        setErrorMsg("Please Complete the Customer Details");
        return;
      }

      setOpenSaveModal(true);
    }
  }

  function handleClear() {
    if (cartView === "serviceForm") {
      clearServiceOnly();
      setOpenClearModal(false);
      return;
    }

    clearAll();
    setOpenClearModal(false);
  }

  async function handleConfirmSave() {
    if (isSaving) return;

    setIsSaving(true);

    if (cartView === "serviceForm") {
      await submitServiceQuote();
      return;
    }

    await submitQuote();
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: quoteNum ? `Quotation-${quoteNum}` : "Quotation",
    pageStyle: `
      @page { size: letter; margin: 1mm; }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page-break {
          break-before: page;
          page-break-before: always;
        }

        .avoid-break {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    `,
  });

  return (
    <>
      <nav className="bg-[#3b4044] shadow-md text-white mb-6">
        <div className="mx-auto max-w-6xl px-4 md:px-10 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <House
              onClick={() => {
                if (quoteStatus === "locked") {
                  navigate(`/`);
                  clearAll();
                } else {
                  navigate(`/`);
                }
              }}
              strokeWidth={1.5}
              className="hover:text-green-400 transition-colors duration-300 ease-in-out cursor-pointer"
            />

            {quoteStatus !== "locked" && (
              <>
                <button
                  type="button"
                  className="rounded-full px-4 py-2 hover:text-green-400 transition"
                  onClick={() =>
                    setCartView(cartView === "form" ? "serviceForm" : "form")
                  }
                >
                  {cartView === "serviceForm" && "Quotation Form"}
                  {cartView === "form" && "Service Form"}
                </button>

                <button
                  type="button"
                  className="rounded-full px-4 py-2 hover:text-green-300 transition"
                  onClick={() => {
                    if (cartView === "form") {
                      setCartView("history");
                      return;
                    }

                    if (cartView === "history") {
                      setCartView("form");
                      return;
                    }

                    if (cartView === "serviceForm") {
                      setCartView("serviceHistory");
                      return;
                    }

                    if (cartView === "serviceHistory") {
                      setCartView("serviceForm");
                      return;
                    }
                  }}
                >
                  {cartView === "form" && "Quotation History"}
                  {cartView === "history" && "Quotation Form"}
                  {cartView === "serviceForm" && "Service History"}
                  {cartView === "serviceHistory" && "Service Form"}
                </button>

                {cartView === "form" && (
                  <button
                    type="button"
                    className="rounded-full px-4 py-2 hover:text-green-400 transition"
                    onClick={handleOpenDiscout}
                  >
                    Discount All
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {quoteStatus !== "locked" &&
              (cartView === "form" || cartView === "serviceForm") && (
                <>
                  <BrushCleaning
                    onClick={() => setOpenClearModal(true)}
                    strokeWidth={1.5}
                    className="hover:text-red-300 transition-colors duration-300 ease-in-out cursor-pointer"
                  />
                  <Save
                    onClick={handleSave}
                    strokeWidth={1.5}
                    className="hover:text-green-400 transition-colors duration-300 ease-in-out cursor-pointer"
                  />
                </>
              )}

            {quoteStatus === "locked" &&
              (cartView === "form" || cartView === "serviceForm") && (
                <Printer onClick={handlePrint} strokeWidth={1.5} />
              )}
          </div>
        </div>
      </nav>

      <Modal
        open={openDiscountModal}
        onClose={() => setOpenDiscountModal(false)}
      >
        <div className="flex flex-col">
          Discount
          <input
            type="number"
            className="w-full h-10 rounded-2xl border border-black px-4 mt-4"
            ref={discountValue}
          />
          <button
            className="bg-green-500 w-36 h-8 rounded-2xl ml-auto text-white mt-4"
            onClick={handleDiscount}
          >
            Ok
          </button>
        </div>
      </Modal>

      <Modal open={openSaveModal} onClose={() => setOpenSaveModal(false)}>
        <p className="text-center text-gray-600">
          {cartView === "serviceForm"
            ? "Are you sure you want to save this service quotation?"
            : "Are you sure you want to save this quotation?"}
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <button
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            onClick={() => setOpenSaveModal(false)}
          >
            Cancel
          </button>

          <button
            className={`px-5 py-2 rounded-xl text-white hover:bg-green-600 transition ${
              isSaving ? "bg-green-300" : "bg-green-500"
            }`}
            onClick={handleConfirmSave}
            disabled={isSaving}
          >
            Confirm
          </button>
        </div>
      </Modal>

      <Modal open={openClearModal} onClose={() => setOpenClearModal(false)}>
        <p className="text-center text-gray-600">
          {cartView === "serviceForm"
            ? "Are you sure you want to clear this service quotation?"
            : "Are you sure you want to clear this quotation?"}
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <button
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            onClick={() => setOpenClearModal(false)}
          >
            Cancel
          </button>

          <button
            className="px-5 py-2 rounded-xl text-white hover:bg-red-600 bg-red-500 transition"
            onClick={handleClear}
          >
            Confirm
          </button>
        </div>
      </Modal>

      <Modal open={openErrorModal} onClose={() => setOpenErrorModal(false)}>
        {errorMsg}
      </Modal>
    </>
  );
}
