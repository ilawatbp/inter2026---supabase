import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminLoginReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [logs, setLogs] = useState([]);
  const [latestPerUser, setLatestPerUser] = useState([]);
  const [unapprovedDevices, setUnapprovedDevices] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      // 1) full login logs
      const { data: logsData, error: logsError } = await supabase
        .from("login_audit_logs")
        .select(`
          id,
          created_at,
          user_id,
          email,
          branch_id,
          event_type,
          result,
          reason,
          device_id,
          ip_address,
          geo_json,
          user_agent,
          latitude,
          longitude
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (logsError) throw logsError;

      // 2) user devices
      const { data: devicesData, error: devicesError } = await supabase
        .from("user_devices")
        .select(`
          id,
          user_id,
          device_id,
          device_name,
          user_agent,
          browser,
          browser_version,
          os,
          os_version,
          platform,
          screen_resolution,
          timezone,
          language,
          first_ip,
          first_geo_json,
          first_seen_at,
          last_ip,
          last_geo_json,
          last_seen_at,
          location_consent,
          branch_approved,
          approved_at,
          approved_by_email,
          is_active,
          first_lat,
          first_lng,
          last_lat,
          last_lng,
          location_denied,
          otp_verified_at
        `);

      if (devicesError) throw devicesError;

      const deviceMap = new Map();
      for (const d of devicesData || []) {
        const key = `${d.user_id || ""}__${d.device_id || ""}`;
        deviceMap.set(key, d);
      }

      const mergedLogs = (logsData || []).map((log) => {
        const key = `${log.user_id || ""}__${log.device_id || ""}`;
        const device = deviceMap.get(key);

        return {
          ...log,
          device_name: device?.device_name || "",
          browser: device?.browser || "",
          browser_version: device?.browser_version || "",
          os: device?.os || "",
          os_version: device?.os_version || "",
          platform: device?.platform || "",
          screen_resolution: device?.screen_resolution || "",
          timezone: device?.timezone || "",
          language: device?.language || "",
          location_consent: device?.location_consent ?? null,
          location_denied: device?.location_denied ?? null,
          branch_approved: device?.branch_approved ?? null,
          approved_at: device?.approved_at || null,
          approved_by_email: device?.approved_by_email || "",
          is_active: device?.is_active ?? null,
          otp_verified_at: device?.otp_verified_at || null,
          first_seen_at: device?.first_seen_at || null,
          last_seen_at: device?.last_seen_at || null,
          first_ip: device?.first_ip || "",
          last_ip: device?.last_ip || "",
          first_lat: device?.first_lat ?? null,
          first_lng: device?.first_lng ?? null,
          last_lat: device?.last_lat ?? null,
          last_lng: device?.last_lng ?? null,
        };
      });

      setLogs(mergedLogs);

      // latest successful login per user
      const successfulLogs = mergedLogs.filter(
        (row) => String(row.result || "").toLowerCase() === "success"
      );

      const latestMap = new Map();
      for (const row of successfulLogs) {
        const key = row.email || row.user_id;
        if (!key) continue;

        if (!latestMap.has(key)) {
          latestMap.set(key, row);
        }
      }

      setLatestPerUser(Array.from(latestMap.values()));

      // unapproved or pending devices
      const filteredDevices = (devicesData || []).filter(
        (d) => d.branch_approved === false || d.otp_verified_at == null
      );

      setUnapprovedDevices(filteredDevices);
    } catch (err) {
      console.error("Admin login report load error:", err);
      setError(err.message || "Failed to load login reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filteredLogs = useMemo(() => {
    let rows = [...logs];

    if (dateFilter) {
      rows = rows.filter((row) => {
        if (!row.created_at) return false;
        return row.created_at.slice(0, 10) === dateFilter;
      });
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      rows = rows.filter((row) => {
        return (
          String(row.email || "").toLowerCase().includes(q) ||
          String(row.event_type || "").toLowerCase().includes(q) ||
          String(row.result || "").toLowerCase().includes(q) ||
          String(row.reason || "").toLowerCase().includes(q) ||
          String(row.device_id || "").toLowerCase().includes(q) ||
          String(row.device_name || "").toLowerCase().includes(q) ||
          String(row.ip_address || "").toLowerCase().includes(q) ||
          String(row.browser || "").toLowerCase().includes(q) ||
          String(row.os || "").toLowerCase().includes(q)
        );
      });
    }

    if (activeTab === "success") {
      rows = rows.filter(
        (row) => String(row.result || "").toLowerCase() === "success"
      );
    }

    if (activeTab === "failed") {
      rows = rows.filter(
        (row) => String(row.result || "").toLowerCase() !== "success"
      );
    }

    if (activeTab === "suspicious") {
      rows = rows.filter((row) => {
        const isFailed = String(row.result || "").toLowerCase() !== "success";
        const locationDenied = row.location_denied === true;
        const notApproved = row.branch_approved === false;
        const noOtp = row.otp_verified_at == null;
        const inactive = row.is_active === false;

        return isFailed || locationDenied || notApproved || noOtp || inactive;
      });
    }

    if (activeTab === "today") {
      const today = new Date().toISOString().slice(0, 10);
      rows = rows.filter((row) => row.created_at?.slice(0, 10) === today);
    }

    return rows;
  }, [logs, activeTab, searchText, dateFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(
      (row) => String(row.result || "").toLowerCase() === "success"
    ).length;
    const failed = logs.filter(
      (row) => String(row.result || "").toLowerCase() !== "success"
    ).length;
    const suspicious = logs.filter((row) => {
      const isFailed = String(row.result || "").toLowerCase() !== "success";
      const locationDenied = row.location_denied === true;
      const notApproved = row.branch_approved === false;
      const noOtp = row.otp_verified_at == null;
      const inactive = row.is_active === false;
      return isFailed || locationDenied || notApproved || noOtp || inactive;
    }).length;

    const today = new Date().toISOString().slice(0, 10);
    const todayCount = logs.filter(
      (row) => row.created_at?.slice(0, 10) === today
    ).length;

    return {
      total,
      success,
      failed,
      suspicious,
      todayCount,
      unapprovedDevices: unapprovedDevices.length,
      latestUsers: latestPerUser.length,
    };
  }, [logs, unapprovedDevices, latestPerUser]);

  function formatDateTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  }

  function badgeClass(value) {
    const v = String(value || "").toLowerCase();
    if (v === "success") return "bg-green-100 text-green-700";
    if (v === "failed") return "bg-red-100 text-red-700";
    if (v === "error") return "bg-red-100 text-red-700";
    if (v === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-lg font-semibold">Loading admin login reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Login Reports</h1>
          <p className="text-sm text-gray-500">
            Monitor user logins, suspicious access, devices, and personnel activity.
          </p>
        </div>

        <button
          onClick={loadReports}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
        <SummaryCard title="Total Logs" value={stats.total} />
        <SummaryCard title="Today" value={stats.todayCount} />
        <SummaryCard title="Success" value={stats.success} />
        <SummaryCard title="Failed" value={stats.failed} />
        <SummaryCard title="Suspicious" value={stats.suspicious} />
        <SummaryCard title="Pending Devices" value={stats.unapprovedDevices} />
        <SummaryCard title="Latest Users" value={stats.latestUsers} />
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            placeholder="Search email, event, result, device, IP, browser, OS..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <TabButton
            label="All"
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          />
          <TabButton
            label="Today"
            active={activeTab === "today"}
            onClick={() => setActiveTab("today")}
          />
          <TabButton
            label="Successful"
            active={activeTab === "success"}
            onClick={() => setActiveTab("success")}
          />
          <TabButton
            label="Failed"
            active={activeTab === "failed"}
            onClick={() => setActiveTab("failed")}
          />
          <TabButton
            label="Suspicious"
            active={activeTab === "suspicious"}
            onClick={() => setActiveTab("suspicious")}
          />
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Login Activity</h2>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Browser / OS</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Geo</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3">OTP</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-6 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.email || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.event_type || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass(
                          row.result
                        )}`}
                      >
                        {row.result || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      {row.reason || "-"}
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <div>{row.device_name || row.device_id || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {row.device_id || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <div>{row.browser || "-"}</div>
                      <div className="text-xs text-gray-500">{row.os || "-"}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.ip_address || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.latitude && row.longitude
                        ? `${row.latitude}, ${row.longitude}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.branch_approved === true
                        ? "Approved"
                        : row.branch_approved === false
                        ? "Not Approved"
                        : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.otp_verified_at
                        ? formatDateTime(row.otp_verified_at)
                        : "Not Verified"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.is_active === true
                        ? "Active"
                        : row.is_active === false
                        ? "Inactive"
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Login Per User */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Latest Successful Login Per User</h2>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">OTP Verified</th>
                <th className="px-4 py-3">Approved</th>
              </tr>
            </thead>
            <tbody>
              {latestPerUser.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                    No latest login data found.
                  </td>
                </tr>
              ) : (
                latestPerUser.map((row) => (
                  <tr key={`${row.email}-${row.id}`} className="border-t">
                    <td className="px-4 py-3">{row.email || "-"}</td>
                    <td className="px-4 py-3">{formatDateTime(row.created_at)}</td>
                    <td className="px-4 py-3">
                      {row.device_name || row.device_id || "-"}
                    </td>
                    <td className="px-4 py-3">{row.ip_address || "-"}</td>
                    <td className="px-4 py-3">
                      {row.otp_verified_at
                        ? formatDateTime(row.otp_verified_at)
                        : "Not Verified"}
                    </td>
                    <td className="px-4 py-3">
                      {row.branch_approved === true ? "Approved" : "No"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unapproved Devices */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Unapproved / Pending Devices</h2>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">First Seen</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Browser / OS</th>
                <th className="px-4 py-3">First IP</th>
                <th className="px-4 py-3">Location Consent</th>
                <th className="px-4 py-3">Location Denied</th>
                <th className="px-4 py-3">Approved</th>
                <th className="px-4 py-3">OTP Verified</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedDevices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-6 text-center text-gray-500">
                    No unapproved or pending devices found.
                  </td>
                </tr>
              ) : (
                unapprovedDevices.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3">{formatDateTime(row.first_seen_at)}</td>
                    <td className="px-4 py-3">{row.user_id}</td>
                    <td className="px-4 py-3">
                      <div>{row.device_name || row.device_id || "-"}</div>
                      <div className="text-xs text-gray-500">{row.device_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{row.browser || "-"}</div>
                      <div className="text-xs text-gray-500">{row.os || "-"}</div>
                    </td>
                    <td className="px-4 py-3">{row.first_ip || "-"}</td>
                    <td className="px-4 py-3">
                      {row.location_consent ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {row.location_denied ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {row.branch_approved ? "Approved" : "Pending"}
                    </td>
                    <td className="px-4 py-3">
                      {row.otp_verified_at
                        ? formatDateTime(row.otp_verified_at)
                        : "Not Verified"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium border ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}