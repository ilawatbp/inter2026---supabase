import { useEffect, useState } from "react";
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export default function AddUser() {
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
    branch_id: "",
    role: "staff",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("idle");

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    setMsg("");

    const { data, error } = await supabase
      .from("branches")
      .select("id, branch_code, branch_name")
      .eq("is_active", true)
      .order("branch_name", { ascending: true });

    if (error) {
      setMsg(error.message);
      setMsgType("error");
      return;
    }

    setBranches(data || []);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setMsgType("idle");

    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: formData.email,
          fullname: formData.fullname,
          branch_id: Number(formData.branch_id),
          role: formData.role,
          password: formData.password,
        },
      });

      if (error) throw error;

      setMsg(data?.message || "User created successfully");
      setMsgType("success");

      setFormData({
        email: "",
        fullname: "",
        branch_id: "",
        role: "staff",
        password: "",
      });
    } catch (err) {
      if (err instanceof FunctionsHttpError) {
        const errorJson = await err.context.json();
        setMsg(errorJson?.error || "Function returned an error");
      } else if (err instanceof FunctionsRelayError) {
        setMsg(err.message || "Relay error");
      } else if (err instanceof FunctionsFetchError) {
        setMsg(err.message || "Fetch error");
      } else {
        setMsg(err?.message || "Unexpected error");
      }

      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" h-full w-full rounded-2xl overflow-auto text-white">
      <h2 className="text-2xl font-bold mb-6">Add User</h2>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 text-black"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 text-black"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Branch</label>
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 text-black"
            required
          >
            <option value="" className="text-black">Select branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id} className="text-black">
                {branch.branch_code} - {branch.branch_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 text-black"
          >
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Temporary Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 text-black"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className=" text-white px-6 py-3 rounded-xl disabled:opacity-60 bg-[#3cb54b]"
        >
          {loading ? "Creating..." : "Create User"}
        </button>

        {msg && (
          <p
            className={`mt-4 ${
              msgType === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}