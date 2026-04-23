import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { sileo } from "sileo";

export default function AddBranch() {
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [branchData, setBranchData] = useState({
    branch_code: "",
    branch_name: "",
    company_name: "",
    branch_email: "",
    address: "",
    branch_contact_no: "",
    store_type:"",
  });

  const [bankAccounts, setBankAccounts] = useState([
    {
      bank_name: "",
      account_name: "",
      account_number: "",
      remarks: "",
      is_default: true,
      is_active: true,
    },
  ]);

  function handleInput(name, value) {
    setBranchData((prev) => ({ ...prev, [name]: value }));
  }

  function handleBankInput(index, name, value) {
    setBankAccounts((prev) =>
      prev.map((bank, i) =>
        i === index ? { ...bank, [name]: value } : bank
      )
    );
  }

  function addBankRow() {
    setBankAccounts((prev) => [
      ...prev,
      {
        bank_name: "",
        account_name: "",
        account_number: "",
        remarks: "",
        is_default: false,
        is_active: true,
      },
    ]);
  }

  function removeBankRow(index) {
    setBankAccounts((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      // ensure at least one default remains if may laman pa
      if (updated.length > 0 && !updated.some((item) => item.is_default)) {
        updated[0].is_default = true;
      }

      return updated;
    });
  }

  function setDefaultBank(index) {
    setBankAccounts((prev) =>
      prev.map((bank, i) => ({
        ...bank,
        is_default: i === index,
      }))
    );
  }

  async function handleCreateBranch(e) {
    e.preventDefault();
    setMsg("");

    const {
      branch_code,
      branch_name,
      company_name,
      branch_email,
      address,
      branch_contact_no,
      store_type,
    } = branchData;

    if (!branch_code.trim() || !branch_name.trim()) {
      sileo.error({
        title: "Missing Required Fields",
        description: "Branch code and branch name are required.",
        fill: "#171717",
        styles: {
          description: "!text-white",
        },
      });
      return;
    }

    const filledBanks = bankAccounts.filter(
      (bank) =>
        bank.bank_name.trim() ||
        bank.account_name.trim() ||
        bank.account_number.trim() ||
        bank.remarks.trim()
    );

    for (const bank of filledBanks) {
      if (
        !bank.bank_name.trim() ||
        !bank.account_name.trim() ||
        !bank.account_number.trim()
      ) {
        sileo.error({
          title: "Incomplete Bank Details",
          description:
            "Each bank row must have Bank Name, Account Name, and Account Number.",
          fill: "#171717",
          styles: {
            description: "!text-white",
          },
        });
        return;
      }
    }

    try {
      setSaving(true);

      // 1. Insert branch and get inserted row
      const { data: insertedBranch, error: branchError } = await supabase
        .from("branches")
        .insert({
          branch_code: branch_code.trim(),
          branch_name: branch_name.trim(),
          company_name: company_name.trim(),
          branch_email: branch_email.trim(),
          address: address.trim(),
          branch_contact_no: branch_contact_no.trim(),
          store_type: store_type,
          is_active: true,
        })
        .select("id, branch_name")
        .single();

      if (branchError) {
        sileo.error({
          title: "ERROR IN SAVING BRANCH",
          description: branchError.message,
          fill: "#171717",
          styles: {
            description: "!text-white",
          },
        });
        setMsg(branchError.message);
        return;
      }

      // 2. Insert bank accounts if any
      if (filledBanks.length > 0) {
        const bankPayload = filledBanks.map((bank) => ({
          branch_id: insertedBranch.id,
          bank_name: bank.bank_name.trim(),
          account_name: bank.account_name.trim(),
          account_number: bank.account_number.trim(),
          remarks: bank.remarks.trim() || null,
          is_default: bank.is_default,
          is_active: true,
        }));

        const { error: bankError } = await supabase
          .from("branch_bank_accounts")
          .insert(bankPayload);

        if (bankError) {
          sileo.error({
            title: "BRANCH SAVED, BUT BANK DETAILS FAILED",
            description: bankError.message,
            fill: "#171717",
            styles: {
              description: "!text-white",
            },
          });
          setMsg(bankError.message);
          return;
        }
      }

      sileo.success({
        title: "Successful",
        description: `${insertedBranch.branch_name} successfully added`,
        fill: "#171717",
        styles: {
          description: "!text-white",
        },
      });

      // reset form
      setBranchData({
        branch_code: "",
        branch_name: "",
        company_name: "",
        branch_email: "",
        address: "",
        branch_contact_no: "",
        store_type:"",

      });

      setBankAccounts([
        {
          bank_name: "",
          account_name: "",
          account_number: "",
          remarks: "",
          is_default: true,
          is_active: true,
        },
      ]);

      setMsg("");
    } catch (err) {
      sileo.error({
        title: "UNEXPECTED ERROR",
        description: err.message || "Something went wrong.",
        fill: "#171717",
        styles: {
          description: "!text-white",
        },
      });
      setMsg(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    {console.log(branchData)}
      <form onSubmit={handleCreateBranch} className="mb-8 space-y-5">
        <h2 className="text-xl font-semibold">Create Branch</h2>

        <div className="grid grid-cols-2 gap-6 text-black">
          <div className="flex gap-4 flex-col">
            <input
              type="text"
              placeholder="Branch Code"
              name="branch_code"
              value={branchData.branch_code}
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Branch Name"
              name="branch_name"
              value={branchData.branch_name}
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Company Name"
              name="company_name"
              value={branchData.company_name}
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="E-Mail"
              name="branch_email"
              value={branchData.branch_email}
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex flex-col gap-4">
            <textarea
              placeholder="Address"
              name="address"
              value={branchData.address}
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="w-full p-2 rounded h-full"
            ></textarea>

            <input
              type="text"
              placeholder="Contact Number"
              name="branch_contact_no"
              value={branchData.branch_contact_no}
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <select 
            name="store_type"
            className="border p-2 rounded w-full"
            onChange={(e) => handleInput(e.target.name, e.target.value)}
            value={branchData.store_type}
          >
            <option value="company">Company</option>
            <option value="franchise">Franchise</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Bank Details</h3>
            <button
              type="button"
              onClick={addBankRow}
              className="px-3 py-2 rounded bg-blue-600 text-white"
            >
              Add Bank
            </button>
          </div>

          {bankAccounts.map((bank, index) => (
            <div
              key={index}
              className="border border-white/20 rounded p-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={bank.bank_name}
                  onChange={(e) =>
                    handleBankInput(index, "bank_name", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />

                <input
                  type="text"
                  placeholder="Account Name"
                  value={bank.account_name}
                  onChange={(e) =>
                    handleBankInput(index, "account_name", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />

                <input
                  type="text"
                  placeholder="Account Number"
                  value={bank.account_number}
                  onChange={(e) =>
                    handleBankInput(index, "account_number", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />

                <input
                  type="text"
                  placeholder="Remarks"
                  value={bank.remarks}
                  onChange={(e) =>
                    handleBankInput(index, "remarks", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-white flex items-center gap-2">
                  <input
                    type="radio"
                    name="default_bank"
                    checked={bank.is_default}
                    onChange={() => setDefaultBank(index)}
                  />
                  Default Bank
                </label>

                {bankAccounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBankRow(index)}
                    className="px-3 py-2 rounded bg-red-600 text-white"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {msg && <p className="text-red-400 text-sm">{msg}</p>}

        <div className="flex">
          <button
            type="submit"
            disabled={saving}
            className="text-white px-4 py-2 rounded ml-auto bg-[#3cb54b] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Branch"}
          </button>
        </div>
      </form>
    </>
  );
}