import { useState } from "react";
import logo from "../assets/logo.png";
import lamp from "../assets/bg-lamp.png";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { getDeviceInfo } from "../utils/device";

export default function Login() {
  const { session, otpPending, setOtpPending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpMaskedEmail, setOtpMaskedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [authFlowInProgress, setAuthFlowInProgress] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  if (session && !otpPending && !otpStep && !authFlowInProgress) {
    return <Navigate to="/" replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMsg) {
      setErrorMsg("");
    }
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

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-device-check`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentSession.access_token}`,
      },
      body: JSON.stringify(deviceInfo),
    });


    const result = await res.json();

    if (!res.ok) {
      setErrorMsg(result.error || "Device check failed.");
      setAuthFlowInProgress(false);
      return;
    }

    if (result.trusted) {
      setOtpPending(false);
      setAuthFlowInProgress(false);
      navigate(from, { replace: true });
      return;
    }

    if (result.otp_required) {
      setOtpPending(true);
      setOtpStep(true);
      setOtpMaskedEmail(result.branch_email_masked || "");
      setAuthFlowInProgress(false);
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
      setErrorMsg(verifyResult.error || verifyResult.message || "OTP verification failed.");
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
    } catch (geoErr) {
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
        }),
      }
    );

    const finalizeResult = await finalizeRes.json();

    if (!finalizeRes.ok) {
      setErrorMsg(finalizeResult.error || "Failed to save location.");
      return;
    }

    if (finalizeResult.success) {
      setOtpPending(false);
      setOtpStep(false);
      setOtp("");
      navigate(from, { replace: true });
      return;
    }

    setErrorMsg("Unexpected location approval response.");
  } catch (err) {
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
      (error) => {
        reject(error);
      },
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
    setForm({
      email: "",
      password: "",
    });
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

                <div className="relative">
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

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-black"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`mt-auto w-full h-14 rounded-full border border-black transition-colors duration-300 ease-in-out
                  ${
                    loading
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "hover:bg-[#3cb54b] hover:text-white hover:border-[#3cb54b]"
                  }`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <Link
                to="/forgot-password"
                className="ml-auto text-sm cursor-pointer hover:font-bold"
              >
                Forgot password?
              </Link>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyOtp}
              className="border border-black rounded-3xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col gap-4 bg-white/90 backdrop-blur-sm min-h-[460px]"
            >
              <p className="mr-auto text-sm text-gray-600">Interactive</p>

<div className="rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
  This is a new device. After OTP verification, you must allow location access to continue.
  If you deny location, you will be returned to the login page.
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
                className={`mt-auto w-full h-14 rounded-full border border-black transition-colors duration-300 ease-in-out
                  ${
                    loading
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "hover:bg-[#3cb54b] hover:text-white hover:border-[#3cb54b]"
                  }`}
              >
                {loading || geoLoading ? "Verifying..." : "Verify OTP"}
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