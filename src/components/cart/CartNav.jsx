import { House, Save, BrushCleaning, Printer } from "lucide-react";
import { useShop } from "../../context/ShopContext"
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { sileo } from "sileo";

import { supabase } from "../../lib/supabase";

export default function CartNav({ setCartView, cartView, printRef }) {

  const navigate = useNavigate();
  const [openDiscountModal, setOpenDiscountModal] = useState();
  const [openSaveModal, setOpenSaveModal] = useState();
  const [openClearModal, setOpenClearModal] = useState();
  const [openErrorModal, setOpenErrorModal] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const discountValue = useRef();

  const { cartValue, quoteDetails, setCartValue, setQuoteDetails, defaultQuoteDetails, setQuoteNum, quoteStatus, setQuoteStatus } = useShop();

  const [isSaving, setIsSaving] = useState(false);

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

  async function submitQuote() {
    const userBranchCode = "MUN"; // palitan natin later ng actual logged-in user's branch
    const userId = 1;
    const headerPayload = buildQuotationHeaderPayload({
      quoteDetails,
    });

    try {
      const { data: header, error: headerError } = await supabase.rpc(
        // "create_quotation_header",
        "create_quotation_header_for_current_user",
        headerPayload
      );

      if (headerError) {
        throw new Error(headerError.message || "Failed to save quotation header");
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
          throw new Error(itemsError.message || "Failed to save quotation items");
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
    }
  }


  function clearAll() {
    setCartValue([]);
    setQuoteDetails(structuredClone(defaultQuoteDetails));

    localStorage.setItem("cartValue", JSON.stringify([]));
    localStorage.setItem("quoteDetails", JSON.stringify(defaultQuoteDetails));

    window.location.reload();
  }

  const handleOpenDiscout = () => {
    setOpenDiscountModal(true);
  };

  function handleDiscount() {
    setCartValue((prev) =>
      prev.map((item) => ({
        ...item, Discount: discountValue.current.value
      }))
    )
    setOpenDiscountModal(false)
  }

  function handleSave() {
    if (cartValue.length == 0) {
      setOpenErrorModal(true);
      setErrorMsg("Please Add Atleast one Item")
      return
    }

    for (const item of cartValue) {
      if (item.Quantity == 0) {
        setOpenErrorModal(true);
        setErrorMsg("all items must be atles one quant");
        return;
      }
    }

    if (quoteDetails.Attn == "" || quoteDetails.Comp == "") {
      setOpenErrorModal(true);
      setErrorMsg("Please Complete the Customer Details");
      return;
    }


    setOpenSaveModal(true);
  }



  const lastSavedQno = "last"


  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: lastSavedQno ? `Quotation-${lastSavedQno}` : "Quotation",
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
          {/* LEFT */}
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
              strokeWidth={1.5} className="hover:text-green-400 transition-colors duration-300 ease-in-out cursor-pointer" />

            {quoteStatus !== "locked" && (
              <>
                {/* <button type="button" className="rounded-full px-4 py-2 hover:bg-green-500 transition">
                  Service Form
                </button> */}

                <button type="button" 
                // className="rounded-full px-4 py-2 hover:bg-green-500 transition"
                className="rounded-full px-4 py-2 hover:text-green-300 transition"
                  onClick={() => setCartView(cartView === "form" ? "history" : "form")}
                >
                  {cartView == "form" ? "Quotation History" : "Quotation Form"}
                </button>
                {cartView == "form" && (
                  <button type="button" className="rounded-full px-4 py-2 hover:text-green-400 transition"
                    onClick={handleOpenDiscout}
                  >
                    Discount All
                  </button>
                )}

              </>
            )}
          </div>

          <div className="flex items-center gap-2 ">
            {/* RIGHT */}
            {quoteStatus !== "locked" && cartView == "form" && (
              <>
                <BrushCleaning onClick={() => setOpenClearModal(true)} strokeWidth={1.5} className="hover:text-red-300 transition-colors duration-300 ease-in-out cursor-pointer"/>
                <Save onClick={handleSave} strokeWidth={1.5}  className="hover:text-green-400 transition-colors duration-300 ease-in-out cursor-pointer" />
              </>
            )}
            {quoteStatus === "locked" && cartView == "form" && (
              <Printer onClick={handlePrint} strokeWidth={1.5}></Printer>
            )}




          </div>
        </div>
      </nav>
      <Modal open={openDiscountModal} onClose={() => setOpenDiscountModal(false)}>
        <div className="flex flex-col">
          Discount
          <input type="number" className="w-full h-10 rounded-2xl border border-black px-4 mt-4" ref={discountValue} />
          <button className="bg-green-500 w-36 h-8 rounded-2xl ml-auto text-white mt-4" onClick={handleDiscount}>Ok</button>
        </div>
      </Modal>

      <Modal open={openSaveModal} onClose={() => setOpenSaveModal(false)}>
        {/* Title */}
        {/* Message */}
        <p className="text-center text-gray-600">
          Are you sure you want to save this quotation?
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-2">
          <button
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            onClick={() => setOpenSaveModal(false)}
          >
            Cancel
          </button>

          <button
            className={`px-5 py-2 rounded-xl  text-white hover:bg-green-600 transition 
                        ${isSaving ? 'bg-green-300' : 'bg-green-500'}
                      `}
            onClick={() => {
              submitQuote();
              setIsSaving(true)
            }}
            disabled={isSaving}
          >
            Confirm
          </button>
        </div>
      </Modal>

      <Modal open={openClearModal} onClose={() => setOpenClearModal(false)}>

        <p className="text-center text-gray-600">
          Are you sure you want to clear this quotation?
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-2">
          <button
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            onClick={() => setOpenClearModal(false)}
          >
            Cancel
          </button>

          <button
            className={`px-5 py-2 rounded-xl  text-white hover:bg-red-600 bg-red-500 transition `}
            onClick={() => { clearAll() }}
          >
            Confirm
          </button>
        </div>
      </Modal>

      <Modal open={openErrorModal} onClose={() => setOpenErrorModal(false)}>
        {errorMsg}
      </Modal>
    </>
  )
}