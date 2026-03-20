import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function BranchList() {
  const [branches, setBranches] = useState([]);

  async function loadBranches() {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("branch_name", { ascending: true });

    if (!error) setBranches(data || []);
  }

  useEffect(() => {
    loadBranches();
  }, []);

  return (
    <div>
      <p className="text-white">asdf</p>
      <h2 className="text-xl font-semibold mb-3 text-white">Branches</h2>
      <ul className="space-y-2 text-white">
        {branches.map((branch) => (
          <li key={branch.id} className="border rounded p-3">
            {branch.branch_code} - {branch.branch_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
