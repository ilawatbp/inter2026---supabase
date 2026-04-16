import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";
export default function TermsAndConditions({ viewMode }) {
  // viewmode="serviceForm" or "quotationForm

  const { handleCustomerDetailsOnchange, quoteDetails, quoteStatus } =
    useShop();
  
  const { branch } = useAuth();

  const diffInMs =
    new Date(quoteDetails.validUntil) - new Date(quoteDetails.Qdate);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return (
    <section className="mt-6 text-[10px] leading-tight page-break">
      <h2 className="font-semibold underline mb-3">Terms and Conditions</h2>

      <div className="space-y-2">
        {/* 1 */}
        <div className="grid grid-cols-[190px_1fr] gap-4">
          <div className="font-semibold">1. Payment:</div>
          <div>
            {viewMode === "quotationForm" &&
              "A 50% down payment is required upon order confirmation, with full payment due before delivery/shipment."}
            {viewMode === "serviceForm" &&
              "A 50% down payment is required upon order confirmation of this quotation, with full payment due upon completion of services."}
          </div>
        </div>
        

        {/* 2 */}
        <div className="grid grid-cols-[190px_1fr] gap-4">
          <div className="font-semibold">2. Price Change Notice:</div>
          <div>Price/s may change without prior notice.</div>
        </div>

        {/* 3 */}
        <div className="grid grid-cols-[190px_1fr] gap-4">
          <div className="font-semibold">3. Mode of Payment:</div>
          <div>
            The details below are strictly for online payment or cheque payment
            (subject to clearing).
          </div>
        </div>

        {/* Bank details (indented like screenshot) */}
        {branch?.branch_bank_accounts.map(({ account_name, account_number, bank_name, id }) => {
          return (
            
              <div key={id} className="grid grid-cols-[190px_1fr] gap-4">
                <div />
                <div className="space-y-1">
                  <div className="grid grid-cols-[120px_1fr]">
                    <div className="font-semibold">Bank Name</div>
                    <div>: {bank_name}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr]">
                    <div className="font-semibold">Account</div>
                    <div>: {account_name}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr]">
                    <div className="font-semibold">Account No</div>
                    <div>: {account_number}</div>
                  </div>
                </div>
              </div>
          );
        })}

        
        

        {/* 4 */}
        <div className="grid grid-cols-[190px_1fr] gap-4">
          <div className="font-semibold">4. Validity Period:</div>
          <div>
            This quotation is valid for Seven ({diffInDays}) days only. Kindly
            request a new quotation thereafter.
          </div>
        </div>

        {/* 5 */}

        {viewMode === "quotationForm" && (
          <>
            <div className="grid grid-cols-[190px_1fr] gap-4">
              <div className="font-semibold">5. Delivery Lead Time:</div>
              <input
                type="text"
                className={`px-2 h-4 ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60"}`}
                onChange={(e) =>
                  handleCustomerDetailsOnchange("leadTime", e.target.value)
                }
                defaultValue={quoteDetails?.leadTime}
                disabled={quoteStatus === "locked"}
              />

              <div>{/* leave blank / editable later */}</div>
            </div>

            {/* 6 */}
            <div className="grid grid-cols-[190px_1fr] gap-4">
              <div className="font-semibold">6. Indent Order:</div>
              <div>
                Our lead time is 45-60 days upon receipt of the purchase order
                and down payment.
              </div>
            </div>
          </>
        )}

        {/* 7 */}
        <div className="grid grid-cols-[190px_1fr] gap-4">
          <div className="font-semibold">{viewMode === "quotationForm" ? "7" : "5"}. Value-added Tax:</div>
          <div>All amounts are VAT-inclusive.</div>
        </div>

        {viewMode === "quotationForm" && (
          <>
            {/* 8 */}
            <div className="grid grid-cols-[190px_1fr] gap-4">
              <div className="font-semibold">8. Warranty:</div>
              <input
                type="text"
                className={`px-2 h-4 ${quoteStatus === "locked" ? "bg-white" : "bg-gray-200/60"}`}
                onChange={(e) =>
                  handleCustomerDetailsOnchange("warranty", e.target.value)
                }
                defaultValue={quoteDetails?.warranty}
                disabled={quoteStatus === "locked"}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
