import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import lamp from "../assets/bg-lamp.png";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { getDeviceInfo } from "../utils/device";

export default function Login() {
  const { session, otpPending, setOtpPending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpMaskedEmail, setOtpMaskedEmail] = useState("");

  const [deviceLabel, setDeviceLabel] = useState("");
  const [deviceOwnerName, setDeviceOwnerName] = useState("");
  const [devicePurpose, setDevicePurpose] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [authFlowInProgress, setAuthFlowInProgress] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (session && otpPending) setOtpStep(true);
  }, [session, otpPending]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setAuthFlowInProgress(true);
      setErrorMsg("");

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        setErrorMsg(error.message);
        setAuthFlowInProgress(false);
        return;
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        setErrorMsg("Unable to get session after login.");
        setAuthFlowInProgress(false);
        return;
      }

      const deviceInfo = getDeviceInfo();

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-device-check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify(deviceInfo),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || "Device check failed.");
        setAuthFlowInProgress(false);
        return;
      }

      if (result.trusted === true && result.device_approved === true) {
        setOtpPending(false);
        setOtpStep(false);
        setAuthFlowInProgress(false);
        navigate(from, { replace: true });
        return;
      }

      if (result.otp_required === true) {
        setOtpPending(true);
        setOtpStep(true);
        setOtpMaskedEmail(result.branch_email_masked || "");
        setAuthFlowInProgress(false);
        return;
      }

      if (result.reason === "DEVICE_PENDING_APPROVAL") {
        setOtpPending(false);
        setOtpStep(false);
        setAuthFlowInProgress(false);
        setErrorMsg(result.message || "This device is waiting for admin approval.");
        await supabase.auth.signOut();
        return;
      }

      setErrorMsg("Unexpected login response.");
      setAuthFlowInProgress(false);
    } catch (err) {
      console.error("STEP ERROR in handleSubmit:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setAuthFlowInProgress(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();

    if (!otp.trim()) {
      setErrorMsg("Please enter the OTP.");
      return;
    }

    if (!deviceLabel.trim()) {
      setErrorMsg("Please enter a device label.");
      return;
    }

    if (!deviceOwnerName.trim()) {
      setErrorMsg("Please enter the device owner name.");
      return;
    }

    if (!devicePurpose.trim()) {
      setErrorMsg("Please enter the device purpose.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        setErrorMsg("Your session expired. Please log in again.");
        return;
      }

      const deviceInfo = getDeviceInfo();

      const verifyRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-device-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify({
            ...deviceInfo,
            otp: otp.trim(),
          }),
        }
      );

      const verifyResult = await verifyRes.json();

      if (!verifyRes.ok) {
        setErrorMsg(
          verifyResult.error ||
            verifyResult.message ||
            "OTP verification failed."
        );
        return;
      }

      if (!verifyResult.success || !verifyResult.requires_geolocation) {
        setErrorMsg("Unexpected OTP response.");
        return;
      }

      setGeoLoading(true);

      let coords;

      try {
        coords = await getBrowserLocation();
      } catch {
        await supabase.auth.signOut();

        setOtpPending(false);
        setOtpStep(false);
        setAuthFlowInProgress(false);
        setOtp("");
        setOtpMaskedEmail("");
        setGeoLoading(false);

        setErrorMsg("Location access is required on first login for a new device.");
        navigate("/login", { replace: true });
        return;
      }

      const finalizeRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/finalize-device-approval`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify({
            device_id: deviceInfo.device_id,
            latitude: coords.latitude,
            longitude: coords.longitude,
            device_label: deviceLabel.trim(),
            device_owner_name: deviceOwnerName.trim(),
            device_purpose: devicePurpose.trim(),
          }),
        }
      );

      const finalizeResult = await finalizeRes.json();

      if (!finalizeRes.ok) {
        setErrorMsg(finalizeResult.error || "Failed to save device verification.");
        return;
      }

      if (finalizeResult.success) {
        setOtpPending(false);
        setOtpStep(false);
        setAuthFlowInProgress(false);
        setOtp("");
        setOtpMaskedEmail("");
        setDeviceLabel("");
        setDeviceOwnerName("");
        setDevicePurpose("");

        if (finalizeResult.admin_auto_approved === true) {
          navigate("/", { replace: true });
          return;
        }

        await supabase.auth.signOut();

        setErrorMsg(
          "Device verification completed. Please wait for admin approval before logging in."
        );

        return;
      }

      setErrorMsg("Unexpected location approval response.");
    } catch (err) {
      console.error("OTP verification error:", err);
      setErrorMsg("Something went wrong during OTP verification.");
    } finally {
      setLoading(false);
      setGeoLoading(false);
    }
  }

  function getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }

  async function handleCancelOtp() {
    await supabase.auth.signOut();

    setOtpPending(false);
    setOtpStep(false);
    setAuthFlowInProgress(false);
    setOtp("");
    setOtpMaskedEmail("");
    setDeviceLabel("");
    setDeviceOwnerName("");
    setDevicePurpose("");
    setForm({ email: "", password: "" });
    setErrorMsg("");
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-white flex flex-col">
      <img
        src={lamp}
        alt=""
        className="pointer-events-none fixed z-0 w-[180px] sm:w-[220px] md:w-[280px] right-0 sm:right-6 top-0 opacity-80"
      />

      <div className="relative z-20 w-full px-6 sm:px-10 h-24 flex items-center">
        <img src={logo} alt="ilaw atbp" className="w-[120px] sm:w-[150px]" />
      </div>

      <div className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold capitalize">
              {otpStep ? "Verify device" : "Log in"}
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              {otpStep
                ? `Enter the OTP sent to ${otpMaskedEmail || "your branch email"}`
                : "Sign in to continue to Interactive"}
            </p>
          </div>

          {!otpStep ? (
            <form
              onSubmit={handleSubmit}
              className="border border-black rounded-3xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col gap-4 bg-white/90 backdrop-blur-sm min-h-[460px]"
            >
              <p className="mr-auto text-sm text-gray-600">Interactive</p>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  className="px-5 py-4 border border-black rounded-full w-full outline-none focus:ring-2 focus:ring-black/20"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  className="px-5 py-4 pr-20 border border-black rounded-full w-full outline-none focus:ring-2 focus:ring-black/20"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {errorMsg && (
                <div className="w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`mt-auto w-full h-14 rounded-full border border-black transition-colors duration-300 ease-in-out ${
                  loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "hover:bg-[#3cb54b] hover:text-white hover:border-[#3cb54b]"
                }`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyOtp}
              className="border border-black rounded-3xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col gap-4 bg-white/90 backdrop-blur-sm"
            >
              <p className="mr-auto text-sm text-gray-600">Interactive</p>

              <div className="rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                This is a new device. Please verify OTP, allow location, and
                identify this device before it can be approved.
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  OTP
                </label>

                <input
                  id="otp"
                  name="otp"
                  className="px-5 py-4 border border-black rounded-full w-full outline-none focus:ring-2 focus:ring-black/20"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                  maxLength={6}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="deviceLabel" className="text-sm font-medium">
                  Device Label
                </label>

                <input
                  id="deviceLabel"
                  className="px-5 py-4 border border-black rounded-full w-full outline-none focus:ring-2 focus:ring-black/20"
                  type="text"
                  placeholder="Example: Samsung s10"
                  value={deviceLabel}
                  onChange={(e) => {
                    setDeviceLabel(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="deviceOwnerName" className="text-sm font-medium">
                  Device Owner / User
                </label>

                <input
                  id="deviceOwnerName"
                  className="px-5 py-4 border border-black rounded-full w-full outline-none focus:ring-2 focus:ring-black/20"
                  type="text"
                  placeholder="Example: Juan Dela Cruz"
                  value={deviceOwnerName}
                  onChange={(e) => {
                    setDeviceOwnerName(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="devicePurpose" className="text-sm font-medium">
                  Device Purpose
                </label>

                <input
                  id="devicePurpose"
                  className="px-5 py-4 border border-black rounded-full w-full outline-none focus:ring-2 focus:ring-black/20"
                  type="text"
                  placeholder="Example: Sales Quotation"
                  value={devicePurpose}
                  onChange={(e) => {
                    setDevicePurpose(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                />
              </div>

              {errorMsg && (
                <div className="w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`mt-auto w-full h-14 rounded-full border border-black transition-colors duration-300 ease-in-out ${
                  loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "hover:bg-[#3cb54b] hover:text-white hover:border-[#3cb54b]"
                }`}
              >
                {loading || geoLoading ? "Verifying..." : "Verify Device"}
              </button>

              <button
                type="button"
                onClick={handleCancelOtp}
                disabled={loading}
                className="w-full h-14 rounded-full border border-black hover:bg-black hover:text-white transition-colors duration-300"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      <h5 className="relative z-20 text-center text-xs sm:text-sm text-gray-300 pb-4">
        version - 3.0
      </h5>
    </div>
  );
}