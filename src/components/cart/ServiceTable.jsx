import { CircleX, CirclePlus, Delete } from "lucide-react";
import { useShop } from "../../context/ShopContext";

export default function ServiceTable() {
  const { rowsService, setRowsService, quoteStatus } = useShop();

  const serviceOptions = [
    "Repair",
    "Installation",
    "Maintenance",
    "Fabrication",
  ];

  const addRow = () => {
    setRowsService((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        serviceType: "",
        amount: 0,
        scopes: [""],
      },
    ]);
  };
  

  const deleteRow = (rowId) => {
    setRowsService((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((row) => row.id !== rowId);
    });
  };

  const addScopeField = (rowId) => {
    setRowsService((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, scopes: [...row.scopes, ""] } : row,
      ),
    );
  };

  const deleteScopeField = (rowId, scopeIndex) => {
    setRowsService((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (row.scopes.length === 1) return row;

        return {
          ...row,
          scopes: row.scopes.filter((_, index) => index !== scopeIndex),
        };
      }),
    );
  };

  const updateServiceType = (rowId, value) => {
    setRowsService((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, serviceType: value } : row,
      ),
    );
  };

  const updateAmount = (rowId, value) => {
    setRowsService((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, amount: Number(value) || 0 } : row,
      ),
    );
  };

  const updateScope = (rowId, scopeIndex, value) => {
    setRowsService((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        const updatedScopes = [...row.scopes];
        updatedScopes[scopeIndex] = value;

        return {
          ...row,
          scopes: updatedScopes,
        };
      }),
    );
  };

  const grandTotal = rowsService.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  );

  return (
    <div className="relative w-full max-w-5xl mx-auto p-6 bg-white">
      <table className="w-full border-collapse text-sm rounded-2xl">
        <thead>
          <tr>
            <th className="p-3 text-center font-semibold w-[20%]">
              TYPE OF SERVICE
            </th>
            <th className="p-3 text-center font-semibold w-[55%]">
              SCOPE OF WORK
            </th>
            <th className="p-3 text-center font-semibold w-[20%]">AMOUNT</th>
            <th className="p-3 w-[5%]"></th>
          </tr>
        </thead>

        <tbody>
          {rowsService.map((row, rowIndex) => (
            <tr key={row.id} className="border-t-2 border-b-2">
              <td className={`p-2 align-top`}>
                <div className="flex flex-col gap-2">
                  <select
                    value={row.serviceType}
                    onChange={(e) => updateServiceType(row.id, e.target.value)}
                    className="w-full border border-gray-300 p-2 outline-none rounded-2xl"
                    disabled={quoteStatus === "locked"}
                  >
                    <option value="">Select</option>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </td>

              <td className="p-2 align-top">
                <div className="flex flex-col gap-2">
                  {row.scopes.map((scope, index) => (
                    <div
                      key={index}
                      className="relative flex gap-2 items-center"
                    >
                      <textarea
                        value={scope}
                        onChange={(e) =>
                          updateScope(row.id, index, e.target.value)
                        }
                        rowsService={2}
                        className="w-full resize-none border border-gray-300 p-2 outline-none rounded-2xl"
                        placeholder="Enter scope of work"
                        disabled={quoteStatus === "locked"}
                      />
                      {quoteStatus !== "locked" && (
                        <CircleX
                          onClick={() => deleteScopeField(row.id, index)}
                          className={`absolute hover:text-red-500 text-red-300 fill-white top-[-8px] right-0 h-5 w-5 cursor-pointer ${
                            index === 0 ? "opacity-0 pointer-events-none" : ""
                          }`}
                          strokeWidth={1}
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end">
                    {quoteStatus !== "locked" && (
                      <CirclePlus
                        onClick={() => addScopeField(row.id)}
                        className="text-green-300 hover:text-green-500 cursor-pointer"
                        strokeWidth={1}
                      />
                    )}
                  </div>
                </div>
              </td>

              <td className={`p-2 align-top`}>
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) => updateAmount(row.id, e.target.value)}
                  className="w-full border border-gray-300 p-2 outline-none rounded-2xl"
                  disabled={quoteStatus === "locked"}
                />
              </td>

              <td className="p-2 align-middle text-center">
                {quoteStatus !== "locked" && (
                  <Delete
                    onClick={() => deleteRow(row.id)}
                    strokeWidth={1}
                    className={`mx-auto cursor-pointer hover:text-red-500 text-red-300 ${
                      rowIndex === 0 ? "opacity-0 pointer-events-none" : ""
                    }`}
                  />
                )}
              </td>
            </tr>
          ))}

          <tr>
            <td colSpan={2} className="p-3 text-end font-medium ">
              GRAND TOTAL
            </td>

            <td className="p-2">
              <input
                type="text"
                value={grandTotal}
                readOnly
                className="w-full p-2 outline-none"
              />
            </td>

            <td className="p-2 align-middle text-center">
              {quoteStatus !== "locked" && (
                <CirclePlus
                  onClick={addRow}
                  className="mx-auto text-green-300 hover:text-green-500 cursor-pointer"
                  strokeWidth={1}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
