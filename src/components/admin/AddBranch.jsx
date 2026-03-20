import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddBranch() {
  const [msg, setMsg] = useState("");
  const [branchData, setBranchData] = useState({
    branch_code: "",
    branch_name: "",
    company_name: "",
    branch_email: "",
    address: "",
    branch_contact_no: "",
  });

  async function handleCreateBranch(e) {
    e.preventDefault();
    setMsg("");

    const {branch_code, branch_name, company_name, branch_email, address, branch_contact_no} = branchData

    
    const { error } = await supabase.from("branches").insert({
      branch_code: branch_code,
      branch_name: branch_name,
      company_name: company_name,
      branch_email: branch_email,
      address: address,
      branch_contact_no: branch_contact_no,
      is_active: true,
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Branch created");
  }

  function handleInput(name, value) {
    setBranchData((prev) => ({...prev, [name]: value}))
    console.log(branchData)
  }

  return (
    <>
      <form onSubmit={handleCreateBranch} className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Create Branch</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex gap-4 flex-col">
            <input
              type="text"
              placeholder="Branch Code"
              name="branch_code"
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Branch Name"
              name="branch_name"
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Company Name"
              name="company_name"
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="E-Mail"
              name="branch_email"
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex flex-col gap-4">
            <textarea
              placeholder="Address"
              name="address"
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="w-full p-2 rounded h-full"
            ></textarea>

            <input
              type="text"
              placeholder="Contact Number"
              name="branch_contact_no"
              onChange={(e) => handleInput(e.target.name, e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
        <div className="flex">
          <button
            type="submit"
            className=" text-white px-4 py-2 rounded ml-auto bg-[#3cb54b]"
          >
            Create Branch
          </button>
        </div>
      </form>

      {msg && <p className="mb-4 text-white">{msg}</p>}
    </>
  );
}

// id
// created_at
