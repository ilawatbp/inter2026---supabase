import { useEffect, useMemo, useState } from "react";
import { Search, SquarePen, Printer } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { v4 as uuidv4 } from "uuid";

export default function CartHistory({setCartView}) {
  const [quotations, setQuotations] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {setQuoteDetails, setCartValue, setQuoteNum, setQuoteStatus} = useShop();

async function loadQuotation(qno, isPrinting) {
  try {
    const response = await fetch(`http://192.168.1.100:3001/api/quotation/${qno}`);

    if (!response.ok) {
      throw new Error("Failed to load quotation");
    }

    const data = await response.json();

    setQuoteDetails({
      qinfo: {
        Attn: data.qinfo?.Attn ?? "",
        Comp: data.qinfo?.Comp ?? "",
        Desig: data.qinfo?.Desig ?? "",
        Loc: data.qinfo?.Loc ?? "",
        Proj: data.qinfo?.Proj ?? data.qinfo?.proj ?? "",
        Qdate: data.qinfo?.Qdate ?? "",
        del_charge: data.qinfo?.del_charge ?? "0",
        designationOfUser: data.qinfo?.designationOfUser ?? "",
        frName: data.qinfo?.frName ?? "",
        ins_charge: data.qinfo?.ins_charge ?? "0",
        leadTime: data.qinfo?.leadTime ?? "",
        prepby: data.qinfo?.prepby ?? "",
        validUntil: data.qinfo?.validUntil ?? "",
        warranty: data.qinfo?.warranty ?? "",
      },
      qn: {
        Discount: data.qn?.Discount ?? "Y",
        authDesig: data.qn?.authDesig ?? "",
        authName: data.qn?.authName ?? "",
        cliBusNameSign: data.qn?.cliBusNameSign ?? "-",
        cliDesig: data.qn?.cliDesig ?? "",
        cliName: data.qn?.cliName ?? "",
        deptuser: data.qn?.deptuser ?? "URP",
        ilawBusNameSign: data.qn?.ilawBusNameSign ?? "-",
      },
    });

    if(isPrinting){
      setQuoteNum(data.qinfo?.QNO ?? "",)
    }

    console.log(data.items)
    setCartValue(
    (data.items || []).map((item) => ({
        ...item,
        uid: uuidv4(),
    }))
    );
  } catch (err) {
    console.error(err);
  }

}

  const itemsPerPage = 100;

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("http://192.168.1.100:3001/api/qinfo");
        if (!response.ok) {
          throw new Error("Error in API");
        }

        const data = await response.json();
        setQuotations(data);
      } catch (err) {
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
    return quotations.filter((q) => {
      const qno = String(q.QNO ?? "").toLowerCase();
      const attn = String(q.Attn ?? "").toLowerCase();
      const prepby = String(q.prepby ?? "").toLowerCase();
      const query = search.toLowerCase();

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
                    key={(uuidv4())}
                    className="h-16 border-b border-b-gray-300"
                  >
                    <td>{q.QNO}</td>
                    <td>{q.Attn || "-"}</td>
                    <td>{q.prepby || "-"}</td>
                    <td>{formatDate(q.Qdate)}</td>
                    <td>
                      <div className="flex flex-row justify-end gap-2">
                        <SquarePen
                          strokeWidth={1}
                          className="hover:text-[#3cb54c] cursor-pointer hover:scale-125 h-4 w-4"
                          onClick={() => {loadQuotation(q.QNO); setCartView("form");}}
                        />
                        <Printer
                          strokeWidth={1}
                          className="hover:text-[#3cb54c] cursor-pointer hover:scale-125 h-4 w-4"
                          onClick={() => {loadQuotation(q.QNO, true); setCartView("form"); setQuoteStatus("locked");}}
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