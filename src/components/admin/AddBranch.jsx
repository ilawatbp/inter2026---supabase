import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";


export default function AddBranch() {

  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branches, setBranches] = useState([]);
  const [msg, setMsg] = useState("");



  async function loadBranches() {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("branch_name", { ascending: true });

    if (!error) setBranches(data || []);
  }

  async function handleCreateBranch(e) {
    e.preventDefault();
    setMsg("");

    const { error } = await supabase.from("branches").insert({
      branch_code: branchCode,
      branch_name: branchName,
      is_active: true,
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Branch created");
    setBranchCode("");
    setBranchName("");
    loadBranches();
  }

  useEffect(() => {
    loadBranches();
  }, []);

  return (
    <>
      <form onSubmit={handleCreateBranch} className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Create Branch</h2>

        <input
          type="text"
          placeholder="Branch Code"
          value={branchCode}
          onChange={(e) => setBranchCode(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="Branch Name"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button type="submit" className="bg-white text-black px-4 py-2 rounded">
          Create Branch
        </button>
      </form>

      {msg && <p className="mb-4 text-white">{msg}</p>}

      {/* <div>
        <h2 className="text-xl font-semibold mb-3 text-white">Branches</h2>
        <ul className="space-y-2 text-white">
          {branches.map((branch) => (
            <li key={branch.id} className="border rounded p-3">
              {branch.branch_code} - {branch.branch_name}
            </li>
          ))}
        </ul>
      </div> */}
    </>
  );

}