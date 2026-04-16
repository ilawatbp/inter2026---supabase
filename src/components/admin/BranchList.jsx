import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const [editData, setEditData] = useState({
    branch_code: "",
    branch_name: "",
    company_name: "",
    branch_email: "",
    address: "",
    branch_contact_no: "",
    is_active: true,

    bank_account_id: null,
    bank_name: "",
    account_name: "",
    account_number: "",
  });

  async function loadBranches() {
    setMsg("");

    const { data, error } = await supabase
      .from("branches")
      .select(`
        *,
        branch_bank_accounts (
          id,
          branch_id,
          bank_name,
          account_name,
          account_number
        )
      `)
      .order("branch_name", { ascending: true });

    if (error) {
      setMsg("Failed to load branches: " + error.message);
      return;
    }

    setBranches(data || []);
  }

  useEffect(() => {
    loadBranches();
  }, []);

  function handleEdit(branch) {
    const bank = branch.branch_bank_accounts?.[0] || null;

    setEditingId(branch.id);
    setEditData({
      branch_code: branch.branch_code || "",
      branch_name: branch.branch_name || "",
      company_name: branch.company_name || "",
      branch_email: branch.branch_email || "",
      address: branch.address || "",
      branch_contact_no: branch.branch_contact_no || "",
      is_active: branch.is_active ?? true,

      bank_account_id: bank?.id || null,
      bank_name: bank?.bank_name || "",
      account_name: bank?.account_name || "",
      account_number: bank?.account_number || "",
    });
    setMsg("");
  }

  function handleCancel() {
    setEditingId(null);
    setEditData({
      branch_code: "",
      branch_name: "",
      company_name: "",
      branch_email: "",
      address: "",
      branch_contact_no: "",
      is_active: true,

      bank_account_id: null,
      bank_name: "",
      account_name: "",
      account_number: "",
    });
    setMsg("");
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleUpdate(branchId) {
    setMsg("");

    const { error: branchError } = await supabase
      .from("branches")
      .update({
        branch_code: editData.branch_code,
        branch_name: editData.branch_name,
        company_name: editData.company_name,
        branch_email: editData.branch_email,
        address: editData.address,
        branch_contact_no: editData.branch_contact_no,
        is_active: editData.is_active,
      })
      .eq("id", branchId);

    if (branchError) {
      setMsg("Branch update failed: " + branchError.message);
      return;
    }

    const hasBankValues =
      editData.bank_name.trim() !== "" ||
      editData.account_name.trim() !== "" ||
      editData.account_number.trim() !== "";

    if (hasBankValues) {
      if (editData.bank_account_id) {
        const { error: bankError } = await supabase
          .from("branch_bank_accounts")
          .update({
            bank_name: editData.bank_name,
            account_name: editData.account_name,
            account_number: editData.account_number,
          })
          .eq("id", editData.bank_account_id);

        if (bankError) {
          setMsg("Branch updated, but bank update failed: " + bankError.message);
          return;
        }
      } else {
        const { error: insertBankError } = await supabase
          .from("branch_bank_accounts")
          .insert({
            branch_id: branchId,
            bank_name: editData.bank_name,
            account_name: editData.account_name,
            account_number: editData.account_number,
          });

        if (insertBankError) {
          setMsg("Branch updated, but bank insert failed: " + insertBankError.message);
          return;
        }
      }
    }

    setMsg("Branch and bank details updated successfully.");
    setEditingId(null);
    await loadBranches();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-white">Branches</h2>

      {msg && (
        <p className="mb-3 text-sm text-yellow-300">{msg}</p>
      )}
<div className="max-h-[500px] overflow-y-auto pr-2">
      <ul className="space-y-3 text-white">
        {branches.map((branch) => {
          const bank = branch.branch_bank_accounts?.[0] || null;

          return (
            <li key={branch.id} className="border rounded p-4">
              {editingId === branch.id ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Branch Details</h3>

                  <input
                    type="text"
                    name="branch_code"
                    value={editData.branch_code}
                    onChange={handleChange}
                    placeholder="Branch Code"
                    className="w-full p-2 rounded text-black"
                  />

                  <input
                    type="text"
                    name="branch_name"
                    value={editData.branch_name}
                    onChange={handleChange}
                    placeholder="Branch Name"
                    className="w-full p-2 rounded text-black"
                  />

                  <input
                    type="text"
                    name="company_name"
                    value={editData.company_name}
                    onChange={handleChange}
                    placeholder="Company Name"
                    className="w-full p-2 rounded text-black"
                  />

                  <input
                    type="email"
                    name="branch_email"
                    value={editData.branch_email}
                    onChange={handleChange}
                    placeholder="Branch Email"
                    className="w-full p-2 rounded text-black"
                  />

                  <input
                    type="text"
                    name="address"
                    value={editData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full p-2 rounded text-black"
                  />

                  <input
                    type="text"
                    name="branch_contact_no"
                    value={editData.branch_contact_no}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    className="w-full p-2 rounded text-black"
                  />

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={editData.is_active}
                      onChange={handleChange}
                    />
                    Active
                  </label>

                  <hr className="my-4" />

                  <h3 className="font-semibold text-lg">Bank Details</h3>

                  <input
                    type="text"
                    name="bank_name"
                    value={editData.bank_name}
                    onChange={handleChange}
                    placeholder="Bank Name"
                    className="w-full p-2 rounded text-black"
                  />

                  <input
                    type="text"
                    name="account_name"
                    value={editData.account_name}
                    onChange={handleChange}
                    placeholder="Account Name"
                    className="w-full p-2 rounded text-black"
                  />

                  <input
                    type="text"
                    name="account_number"
                    value={editData.account_number}
                    onChange={handleChange}
                    placeholder="Account Number"
                    className="w-full p-2 rounded text-black"
                  />

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleUpdate(branch.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                    >
                      Save
                    </button>

                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div>
                    <p><strong>Code:</strong> {branch.branch_code}</p>
                    <p><strong>Name:</strong> {branch.branch_name}</p>
                    <p><strong>Company:</strong> {branch.company_name}</p>
                    <p><strong>Email:</strong> {branch.branch_email}</p>
                    <p><strong>Address:</strong> {branch.address}</p>
                    <p><strong>Contact:</strong> {branch.branch_contact_no}</p>
                    <p><strong>Status:</strong> {branch.is_active ? "Active" : "Inactive"}</p>

                    <div className="mt-3">
                      <p className="font-semibold">Bank Details</p>
                      <p><strong>Bank:</strong> {bank?.bank_name || "-"}</p>
                      <p><strong>Account Name:</strong> {bank?.account_name || "-"}</p>
                      <p><strong>Account Number:</strong> {bank?.account_number || "-"}</p>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleEdit(branch)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
    </div>
  );
}