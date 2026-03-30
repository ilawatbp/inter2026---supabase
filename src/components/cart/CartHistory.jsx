import { useEffect, useMemo, useState } from "react";
import { Search, SquarePen, Printer } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../lib/supabase"; // adjust path if needed

export default function CartHistory({ setCartView }) {
  const [quotations, setQuotations] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { setQuoteDetails, setCartValue, setQuoteNum, setQuoteStatus } = useShop();

  const itemsPerPage = 100;

  async function loadQuotation(quotationNo, isPrinting = false) {
    try {
      setError("");

      // 1) Load header
      const { data: header, error: headerError } = await supabase
        .from("quotation_headers")
        .select("*")
        .eq("quotation_no", quotationNo)
        .single();

      if (headerError) {
        throw new Error(headerError.message || "Failed to load quotation header");
      }

      // 2) Load items
      const { data: items, error: itemsError } = await supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", header.id)
        .order("line_no", { ascending: true });

      if (itemsError) {
        throw new Error(itemsError.message || "Failed to load quotation items");
      }


      setQuoteDetails((prev) => ({...prev,  Attn: header.attention ?? "",
        Desig: header.designation ?? "",
        Comp: header.company ?? "",
        Loc: header.location ?? "",
        Proj: header.project_name ?? "",
        Qdate: header.quotation_date ?? "",
        validUntil: header.valid_until ?? "",
        ins_charge: header.installation_charge ?? "0",
        del_charge: header.delivery_charge ?? "0",
        leadTime: header.lead_time ?? "",
        warranty: header.warranty ?? "",
        Discount: header.discount_mode ?? "Y",
        authName: header.authorized_by_name ?? "",
        authDesig: header.authorized_by_designation ?? "",
        cliName: header.client_authorized_name ?? "",
        cliDesig: header.client_authorized_designation ?? "",
        prepby: isPrinting ? header.prepared_by ?? "" : prev.prepby,
        designationOfUser: isPrinting ? header.prepared_by_designation ?? "" : prev.designationOfUser,
        frName: isPrinting ? header.from_name ?? "" : prev.frName,
      }));

      // setQuoteDetails({
      //   Attn: header.attention ?? "",
      //   Desig: header.designation ?? "",
      //   Comp: header.company ?? "",
      //   Loc: header.location ?? "",
      //   Proj: header.project_name ?? "",
      //   Qdate: header.quotation_date ?? "",
      //   validUntil: header.valid_until ?? "",
      //   ins_charge: header.installation_charge ?? "0",
      //   del_charge: header.delivery_charge ?? "0",
      //   leadTime: header.lead_time ?? "",
      //   warranty: header.warranty ?? "",
      //   Discount: header.discount_mode ?? "Y",
      //   authName: header.authorized_by_name ?? "",
      //   authDesig: header.authorized_by_designation ?? "",
      //   cliName: header.client_authorized_name ?? "",
      //   cliDesig: header.client_authorized_designation ?? "",
      //   // prepby: header.prepared_by ?? "",
      //   // designationOfUser: header.prepared_by_designation ?? "",
      //   // frName: header.from_name ?? "",
      // });

      if (isPrinting) {
        setQuoteNum(header.quotation_no ?? "");
      }

      setCartValue(
        (items || []).map((item) => ({
          uid: uuidv4(),
          itemcode: item.item_code ?? "",
          itemname: item.item_description ?? "",
          Area: item.area ?? "",
          Rem: item.notes ?? "",
          Quantity: Number(item.quantity ?? 0),
          SRP: Number(item.unit_price ?? 0),
          Discount: Number(item.discount_percent ?? 0)
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load quotation");
      alert(err.message || "Failed to load quotation");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setError("");

        const { data, error } = await supabase
          .from("quotation_headers")
          .select(`
            id,
            quotation_no,
            attention,
            prepared_by,
            quotation_date,
            created_at
          `)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(error.message || "Error loading quotation history");
        }

        setQuotations(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
        alert(err.message);
      }
    })();
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;

    return date.toLocaleDateString("en-US");
  }

  const filteredQuotations = useMemo(() => {
    const query = search.toLowerCase();

    return quotations.filter((q) => {
      const qno = String(q.quotation_no ?? "").toLowerCase();
      const attn = String(q.attention ?? "").toLowerCase();
      const prepby = String(q.prepared_by ?? "").toLowerCase();

      return (
        qno.includes(query) ||
        attn.includes(query) ||
        prepby.includes(query)
      );
    });
  }, [quotations, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuotations.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex);

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <div>
      <div className="h-24 flex justify-between items-center px-32">
        <h1 className="text-3xl font-bold">Item Quotation History</h1>

        <div className="flex shadow rounded-2xl overflow-hidden">
          <input
            type="text"
            placeholder="Search quotation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 h-10 px-4 outline-none"
          />
          <button
            type="button"
            className="w-12 h-10 bg-[#3cb54c] flex items-center justify-center"
          >
            <Search className="text-white" />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-32 pb-4 text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="w-full flex justify-center">
        <table className="w-3/4">
          <thead>
            <tr className="h-14 border-b-2 border-b-gray-400">
              <th>Quotation No</th>
              <th>Customer</th>
              <th>Prepared By</th>
              <th>Date</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedQuotations.length > 0 ? (
              paginatedQuotations.map((q) => {
                return (
                  <tr
                    key={q.id}
                    className="h-16 border-b border-b-gray-300"
                  >
                    <td>{q.quotation_no}</td>
                    <td>{q.attention || "-"}</td>
                    <td>{q.prepared_by || "-"}</td>
                    <td>{formatDate(q.quotation_date)}</td>
                    <td>
                      <div className="flex flex-row justify-end gap-2">
                        <SquarePen
                          strokeWidth={1}
                          className="hover:text-[#3cb54c] cursor-pointer hover:scale-125 h-4 w-4"
                          onClick={async () => {
                            await loadQuotation(q.quotation_no, false);
                            setQuoteStatus("draft");
                            setCartView("form");
                          }}
                        />
                        <Printer
                          strokeWidth={1}
                          className="hover:text-[#3cb54c] cursor-pointer hover:scale-125 h-4 w-4"
                          onClick={async () => {
                            await loadQuotation(q.quotation_no, true);
                            setQuoteStatus("locked");
                            setCartView("form");
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No quotations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="w-full flex justify-center mt-6">
        <div className="w-3/4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredQuotations.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredQuotations.length)} of{" "}
            {filteredQuotations.length} records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === page
                      ? "bg-[#3cb54c] text-white border-[#3cb54c]"
                      : ""
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}