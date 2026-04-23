import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [editingUser, setEditingUser] = useState(null);

  const [editForm, setEditForm] = useState({
    fullname: "",
    email: "",
    role: "",
    status: "",
    designation: "",
    branch_id: "",
  });

  async function loadUsers() {
    setLoading(true);
    setMsg("");

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        fullname,
        role,
        status,
        designation,
        branch_id,
        branches (
          id,
          branch_name,
          branch_code
        )
      `)
      .order("fullname", { ascending: true });

    if (error) {
      setMsg(`Failed to load users: ${error.message}`);
      setUsers([]);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  }

  async function loadBranches() {
    const { data, error } = await supabase
      .from("branches")
      .select("id, branch_name, branch_code")
      .order("branch_name", { ascending: true });

    if (!error) {
      setBranches(data || []);
    }
  }

  useEffect(() => {
    loadUsers();
    loadBranches();
  }, []);

  function handleEditClick(user) {
    setEditingUser(user);
    setMsg("");

    setEditForm({
      fullname: user.fullname || "",
      email: user.email || "",
      role: user.role || "",
      status: user.status || "",
      designation: user.designation || "",
      branch_id: user.branch_id || "",
    });
  }

  function handleCloseEdit() {
    setEditingUser(null);
    setMsg("");
    setEditForm({
      fullname: "",
      email: "",
      role: "",
      status: "",
      designation: "",
      branch_id: "",
    });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveEdit(e) {
    e.preventDefault();

    if (!editingUser) return;

    setSaving(true);
    setMsg("");

    const payload = {
      fullname: editForm.fullname,
      email: editForm.email,
      role: editForm.role,
      status: editForm.status,
      designation: editForm.designation,
      branch_id: editForm.branch_id || null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", editingUser.id);

    setSaving(false);

    if (error) {
      setMsg(`Failed to update user: ${error.message}`);
      return;
    }

    setMsg("User profile updated successfully.");
    handleCloseEdit();
    loadUsers();
  }

async function handleSendPasswordReset(user) {
  const confirmed = window.confirm(
    `Send password reset email to ${user.email}?`
  );

  if (!confirmed) return;

  setMsg("");

  const { data, error } = await supabase.functions.invoke(
    "admin-send-password-reset",
    {
      body: {
        email: user.email,
      },
    }
  );

  if (error) {
    setMsg(`Failed to send password reset: ${error.message}`);
    return;
  }

  if (data?.error) {
    setMsg(`Failed to send password reset: ${data.error}`);
    return;
  }

  setMsg(`Password reset email sent to ${user.email}`);
}


async function forceLogoutUser(userId) {
  const { error } = await supabase
    .from("profiles")
    .update({ force_logout: true })
    .eq("id", userId)

  if (error) {
    console.error(error)
    alert(error.message)
    return
  }

  alert("User forced logout triggered.")
}

  return (
    <div className="w-full text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">User List</h2>
        <button
          onClick={loadUsers}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {msg && (
        <div className="mb-4 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm">
          {msg}
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-[#1f2937] z-10">
            <tr className="text-left border-b border-white/10">
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-white/70">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-white/70">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3">{user.fullname || "-"}</td>
                  <td className="px-4 py-3">{user.email || "-"}</td>
                  <td className="px-4 py-3">{user.role || "-"}</td>
                  <td className="px-4 py-3">{user.status || "-"}</td>
                  <td className="px-4 py-3">{user.designation || "-"}</td>
                  <td className="px-4 py-3">
                    {user.branches?.branch_name
                      ? `${user.branches.branch_name} (${user.branches.branch_code})`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition"
                      >
                        Edit Profile
                      </button>

                      <button
                        onClick={() => handleSendPasswordReset(user)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
                      >
                        Change Password
                      </button>

                      <button
                        onClick={() => forceLogoutUser(user.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                      >
                        Kick User
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#111827] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold">Edit User Profile</h3>
              <button
                onClick={handleCloseEdit}
                className="text-white/70 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-white/80">Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={editForm.fullname}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-white/80">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-white/80">Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 outline-none"
                >
                  <option value="">Select role</option>
                  <option value="staff">staff</option>
                  <option value="viewer">viewer</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm text-white/80">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 outline-none"
                >
                  <option value="">Select status</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm text-white/80">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={editForm.designation}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-white/80">Branch</label>
                <select
                  name="branch_id"
                  value={editForm.branch_id}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 outline-none"
                >
                  <option value="">No branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name} ({branch.branch_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}