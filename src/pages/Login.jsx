import { useState } from "react";
import logo from "../assets/logo.png";
import lamp from "../assets/bg-lamp.png";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) {
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
      setErrorMsg("");

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl sm:text-4xl font-bold capitalize">Log in</h1>
            <p className="text-sm text-gray-500 mt-2">
              Sign in to continue to Interactive
            </p>
          </div>

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
        </div>
      </div>

      <h5 className="relative z-20 text-center text-xs sm:text-sm text-gray-300 pb-4">
        version - 3.0
      </h5>
    </div>
  );
}