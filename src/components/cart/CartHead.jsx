import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

export default function CartHead() {
  const {
    handleCustomerDetailsOnchange,
    quoteDetails,
    setQuoteDetails,
    quoteNum,
    quoteStatus,
  } = useShop();
  const { branch } = useAuth();
  return (
    <>
      {/* Header Part */}
      <section className="flex flex-row mb-2">
        <div className="flex-1">
          <img src={logo} alt="ilaw atbp" className="w-[150px]" />
        </div>
        <div className="flex-1 flex justify-end">
          <div className="">
            <h1 className="text-[#3bb44b] font-bold">{branch?.company_name}</h1>
            <p className="text-[9px] max-w-64 leading-[1.1]">
              {branch?.address}
            </p>
            <p className="text-[9px] max-w-64 leading-[1.1]">
              Tel No : {branch?.branch_contact_no}
            </p>
            <p className="text-[9px] max-w-64 leading-[1.1]">
              Email : {branch?.branch_email}
            </p>
            <p className="text-[9px] max-w-64 leading-[1.1]">
              Website : www.ilawatbp.com
            </p>
          </div>
        </div>
      </section>


      <hr className="h-[1px] bg-black border-0 mb-2" />

      {/* CUSTOMER DETAILS */}
      <section className="flex flex-row mb-1 text-[9px] leading-none">
        {/* LEFT SIDE */}
        <div className="flex-1 p-1">
          <div className="space-y-[1px]">
            {[
              { label: "ATTENTION", name: "Attn" },
              { label: "DESIGNATION", name: "Desig" },
              { label: "COMPANY", name: "Comp" },
              { label: "LOCATION", name: "Loc" },
              { label: "PROJECT", name: "Proj" },
            ].map((f) => (
              <div key={f.name} className="flex items-center gap-1">
                <div className="w-20 font-semibold">{f.label}</div>
                <input
                  name={f.name}
                  type="text"
                  className={`flex-1 h-4  outline-none px-1 ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60"}`}
                  defaultValue={quoteDetails?.[f.name] || ""}
                  onChange={(e) =>
                    handleCustomerDetailsOnchange(f.name, e.target.value)
                  }
                  disabled={quoteStatus === "locked"}
                />
              </div>
            ))}
          </div>

          {/* FROM / SUBJECT */}
          <div className="mt-3 space-y-[1px]">
            <div className="flex items-center gap-1">
              <div className="w-20 font-semibold">FROM</div>
              <input
                name="from"
                type="text"
                onChange={(e) => {
                  handleCustomerDetailsOnchange("frName", e.target.value);
                }}
                defaultValue={quoteDetails?.frName || ""}
                className={`flex-1 h-4 outline-none px-1 
                                                                        bg-white
                                                                        `}
                disabled="true"
              />
            </div>

            <div className="flex items-center gap-1">
              <div className="w-20 font-semibold">SUBJECT</div>
              <input
                name="subject"
                type="text"
                defaultValue="Quotation"
                className="flex-1 h-4 outline-none px-1"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-1 ">
          <div className="space-y-[1px]">
            <div className="flex items-center gap-1">
              <div className="w-28 font-semibold">DATE</div>
              <input
                name="date"
                type="date"
                value={quoteDetails.Qdate}
                className="flex-1 h-4 px-1 outline-none bg-white"
                disabled
              />
            </div>

            <div className="flex items-center gap-1">
              <div className="w-28 font-semibold">QUOTATION NO.</div>
              <input
                name="quotationNo"
                type="text"
                className="flex-1 h-4 px-1 outline-none bg-white"
                value={quoteNum}
                disabled
              />
            </div>

            <div className="flex items-center gap-1">
              <div className="w-28 font-semibold">VALID UNTIL</div>
              <input
                name="validUntil"
                type="date"
                className={`flex-1 h-4 px-1 outline-none ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60"}`}
                value={quoteDetails.validUntil}
                disabled={quoteStatus === "locked"}
                onChange={(e) =>
                  setQuoteDetails((prev) => ({
                    ...prev,
                    validUntil: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
      </section>

      <hr className="h-[1px] bg-black border-0 mb-2" />

      {/* GREETING / INTRO */}
      <section className="mt-2 text-[10px] leading-tight">
        <p>Dear Sir/Madam,</p>
        <p className="mt-2">
          We&apos;re excited to present you to our proposal.
        </p>
        <p className="mt-2">Have a bright day ahead!</p>
      </section>
    </>
  );
}
