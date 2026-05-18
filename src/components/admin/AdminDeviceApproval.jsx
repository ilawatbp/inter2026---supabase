import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDeviceApproval() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  }

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");

      const { data: deviceRows, error: deviceError } = await supabase
        .from("user_devices")
        .select(`
          id,
          user_id,
          device_id,
          device_name,
          device_label,
          device_owner_name,
          device_purpose,
          browser,
          os,
          status,
          is_approved,
          is_active,
          first_ip,
          last_ip,
          created_at,
          approved_at,
          last_seen_at,
          last_login_at
        `)
        .order("id", { ascending: false });

      if (deviceError) {
        setError(deviceError.message);
        return;
      }

      const userIds = [
        ...new Set((deviceRows || []).map((d) => d.user_id).filter(Boolean)),
      ];

      let profileRows = [];

      if (userIds.length > 0) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id,
            email,
            fullname,
            role,
            branches (
              branch_name
            )
          `)
          .in("id", userIds);

        if (profileError) {
          setError(profileError.message);
          return;
        }

        profileRows = data || [];
      }

      const profileMap = new Map(profileRows.map((p) => [p.id, p]));

      const merged = (deviceRows || []).map((d) => ({
        ...d,
        profile: profileMap.get(d.user_id) || null,
      }));

      setDevices(merged);
    } catch (err) {
      console.error(err);
      setError("Failed to load devices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
  }, []);

  async function handleAction(deviceId, action) {
    try {
      setActionLoading(deviceId);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-device-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            device_id: deviceId,
            action,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Action failed");
        return;
      }

      await loadDevices();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="w-full p-6 text-sm text-gray-500">
        Loading devices...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Device Approval Management</h2>

        <button
          onClick={loadDevices}
          className="px-4 py-2 rounded-xl border hover:bg-black hover:text-white transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-auto border rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3">Account</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Branch</th>
              <th className="p-3">Device Label</th>
              <th className="p-3">Owner / User</th>
              <th className="p-3">Purpose</th>
              <th className="p-3">Device Info</th>
              <th className="p-3">Browser / OS</th>
              <th className="p-3">IP</th>
              <th className="p-3">Status</th>
              <th className="p-3">Approved</th>
              <th className="p-3">Last Seen</th>
              <th className="p-3">Approved At</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-t align-top">
                <td className="p-3 min-w-[220px]">
                  <div className="font-medium">{d.profile?.email || "-"}</div>
                  <div className="text-xs text-gray-400 break-all">
                    {d.user_id}
                  </div>
                </td>

                <td className="p-3 min-w-[140px]">
                  {d.profile?.fullname || "-"}
                </td>

                <td className="p-3 capitalize">{d.profile?.role || "-"}</td>

                <td className="p-3 min-w-[140px]">
                  {d.profile?.branches?.branch_name || "-"}
                </td>

                <td className="p-3 min-w-[180px] font-medium">
                  {d.device_label || "-"}
                </td>

                <td className="p-3 min-w-[160px]">
                  {d.device_owner_name || "-"}
                </td>

                <td className="p-3 min-w-[160px]">
                  {d.device_purpose || "-"}
                </td>

                <td className="p-3 min-w-[220px]">
                  <div>{d.device_name || "-"}</div>
                  <div className="text-xs text-gray-400 break-all">
                    {d.device_id}
                  </div>
                </td>

                <td className="p-3 min-w-[120px]">
                  <div>{d.browser || "-"}</div>
                  <div className="text-xs text-gray-500">{d.os || "-"}</div>
                </td>

                <td className="p-3 min-w-[120px]">
                  <div>{d.last_ip || d.first_ip || "-"}</div>
                  {d.last_ip && d.first_ip && d.last_ip !== d.first_ip && (
                    <div className="text-xs text-gray-400">
                      First: {d.first_ip}
                    </div>
                  )}
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      d.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : d.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {d.status || "-"}
                  </span>
                </td>

                <td className="p-3">{d.is_approved ? "Yes" : "No"}</td>

                <td className="p-3 min-w-[160px]">
                  {formatDate(d.last_seen_at || d.last_login_at)}
                </td>

                <td className="p-3 min-w-[160px]">
                  {formatDate(d.approved_at)}
                </td>

                <td className="p-3 min-w-[260px]">
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={actionLoading === d.id}
                      onClick={() => handleAction(d.id, "approve")}
                      className="px-3 py-2 rounded-xl border bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50"
                    >
                      Approve
                    </button>

                    <button
                      disabled={actionLoading === d.id}
                      onClick={() => handleAction(d.id, "reject")}
                      className="px-3 py-2 rounded-xl border bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                    >
                      Reject
                    </button>

                    <button
                      disabled={actionLoading === d.id}
                      onClick={() => handleAction(d.id, "revoke")}
                      className="px-3 py-2 rounded-xl border bg-black text-white hover:opacity-80 transition disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!devices.length && (
              <tr>
                <td colSpan={15} className="p-8 text-center text-gray-500">
                  No devices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}