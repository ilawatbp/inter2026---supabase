import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const emptyBank = {
  id: null,
  bank_name: "",
  account_name: "",
  account_number: "",
};

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
    store_type: "company",
    is_active: true,
    bank_accounts: [],
    original_bank_ids: [],
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
    const banks = branch.branch_bank_accounts || [];

    setEditingId(branch.id);
    setEditData({
      branch_code: branch.branch_code || "",
      branch_name: branch.branch_name || "",
      company_name: branch.company_name || "",
      branch_email: branch.branch_email || "",
      address: branch.address || "",
      branch_contact_no: branch.branch_contact_no || "",
      store_type: branch.store_type || "company",
      is_active: branch.is_active ?? true,
      bank_accounts:
        banks.length > 0
          ? banks.map((bank) => ({
            id: bank.id,
            bank_name: bank.bank_name || "",
            account_name: bank.account_name || "",
            account_number: bank.account_number || "",
          }))
          : [{ ...emptyBank }],
      original_bank_ids: banks.map((bank) => bank.id),
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
      store_type: "company",
      is_active: true,
      bank_accounts: [],
      original_bank_ids: [],
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

  function handleBankChange(index, field, value) {
    setEditData((prev) => {
      const updatedBanks = [...prev.bank_accounts];
      updatedBanks[index] = {
        ...updatedBanks[index],
        [field]: value,
      };

      return {
        ...prev,
        bank_accounts: updatedBanks,
      };
    });
  }

  function handleAddBank() {
    setEditData((prev) => ({
      ...prev,
      bank_accounts: [...prev.bank_accounts, { ...emptyBank }],
    }));
  }

  function handleRemoveBank(index) {
    setEditData((prev) => ({
      ...prev,
      bank_accounts: prev.bank_accounts.filter((_, i) => i !== index),
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
        store_type: editData.store_type,
        is_active: editData.is_active,
      })
      .eq("id", branchId);

    if (branchError) {
      setMsg("Branch update failed: " + branchError.message);
      return;
    }

    const cleanedBanks = editData.bank_accounts.filter((bank) => {
      return (
        bank.bank_name.trim() !== "" ||
        bank.account_name.trim() !== "" ||
        bank.account_number.trim() !== ""
      );
    });

    const remainingExistingIds = cleanedBanks
      .filter((bank) => bank.id)
      .map((bank) => bank.id);

    const deletedBankIds = editData.original_bank_ids.filter(
      (id) => !remainingExistingIds.includes(id)
    );

    if (deletedBankIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("branch_bank_accounts")
        .delete()
        .in("id", deletedBankIds);

      if (deleteError) {
        setMsg("Branch updated, but bank delete failed: " + deleteError.message);
        return;
      }
    }

    for (const bank of cleanedBanks) {
      if (bank.id) {
        const { error: updateBankError } = await supabase
          .from("branch_bank_accounts")
          .update({
            bank_name: bank.bank_name,
            account_name: bank.account_name,
            account_number: bank.account_number,
          })
          .eq("id", bank.id);

        if (updateBankError) {
          setMsg("Branch updated, but bank update failed: " + updateBankError.message);
          return;
        }
      } else {
        const { error: insertBankError } = await supabase
          .from("branch_bank_accounts")
          .insert({
            branch_id: branchId,
            bank_name: bank.bank_name,
            account_name: bank.account_name,
            account_number: bank.account_number,
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
    <div className="min-h-dvh">
      <h2 className="text-xl font-semibold mb-3 text-white">Branches</h2>

      {msg && <p className="mb-3 text-sm text-yellow-300">{msg}</p>}

      <div className="flex flex-wrap gap-4 justify-center">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`
              border w-[45%] p-10 rounded-xl bg-black text-white
              ${branch.store_type === "company" ? "border-green-500" : "border-orange-500"}
            `}
          >
            {editingId === branch.id ? (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Branch Details</h3>

                <input name="branch_code" value={editData.branch_code} onChange={handleChange} placeholder="Branch Code" className="w-full p-2 rounded text-black" />
                <input name="branch_name" value={editData.branch_name} onChange={handleChange} placeholder="Branch Name" className="w-full p-2 rounded text-black" />
                <input name="company_name" value={editData.company_name} onChange={handleChange} placeholder="Company Name" className="w-full p-2 rounded text-black" />
                <input name="branch_email" value={editData.branch_email} onChange={handleChange} placeholder="Branch Email" className="w-full p-2 rounded text-black" />
                <input name="address" value={editData.address} onChange={handleChange} placeholder="Address" className="w-full p-2 rounded text-black" />
                <input name="branch_contact_no" value={editData.branch_contact_no} onChange={handleChange} placeholder="Contact Number" className="w-full p-2 rounded text-black" />

                <select
                  name="store_type"
                  className="border p-2 rounded w-full text-black"
                  value={editData.store_type}
                  onChange={handleChange}
                >
                  <option value="company">Company</option>
                  <option value="franchise">Franchise</option>
                </select>

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

                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Bank Details</h3>

                  <button
                    type="button"
                    onClick={handleAddBank}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    Add Bank Details
                  </button>
                </div>

                {editData.bank_accounts.map((bank, index) => (
                  <div key={index} className="border border-gray-600 p-3 rounded space-y-2">
                    <input
                      type="text"
                      value={bank.bank_name}
                      onChange={(e) => handleBankChange(index, "bank_name", e.target.value)}
                      placeholder="Bank Name"
                      className="w-full p-2 rounded text-black"
                    />

                    <input
                      type="text"
                      value={bank.account_name}
                      onChange={(e) => handleBankChange(index, "account_name", e.target.value)}
                      placeholder="Account Name"
                      className="w-full p-2 rounded text-black"
                    />

                    <input
                      type="text"
                      value={bank.account_number}
                      onChange={(e) => handleBankChange(index, "account_number", e.target.value)}
                      placeholder="Account Number"
                      className="w-full p-2 rounded text-black"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveBank(index)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}

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

                  <p>
                    <strong>Store Type: </strong>
                    <span className={branch.store_type === "company" ? "text-green-300" : "text-orange-300"}>
                      {branch.store_type}
                    </span>
                  </p>

                  <p><strong>Status:</strong> {branch.is_active ? "Active" : "Inactive"}</p>

                  {(branch.branch_bank_accounts || []).length > 0 ? (
                    branch.branch_bank_accounts.map((branchBank) => (
                      <div key={branchBank.id} className="mt-3">
                        <p className="font-semibold">Bank Details</p>
                        <p><strong>Bank:</strong> {branchBank.bank_name || "-"}</p>
                        <p><strong>Account Name:</strong> {branchBank.account_name || "-"}</p>
                        <p><strong>Account Number:</strong> {branchBank.account_number || "-"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="mt-3 text-gray-400">No bank details yet.</p>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => handleEdit(branch)}
                    className="bg-green-600 hover:bg-green-400 px-6 py-2 rounded-xl"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}