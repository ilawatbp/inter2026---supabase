import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function UpdatePassword() {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [canReset, setCanReset] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkResetSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setCanReset(true);
      }

      setChecking(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTH EVENT:", event);

      if (event === "PASSWORD_RECOVERY") {
        setCanReset(true);
        setChecking(false);
        return;
      }

      if (session) {
        setCanReset(true);
        setChecking(false);
      }
    });

    checkResetSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setMsg("");
    setMsgType("error");

    if (!password || !confirmPassword) {
      setMsg("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMsg(error.message);
        setMsgType("error");
        return;
      }

      setMsg("Password updated successfully. Redirecting to login...");
      setMsgType("success");

      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      console.error(err);
      setMsg("Something went wrong. Please try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4">
        <p className="text-gray-600">Checking reset link...</p>
      </div>
    );
  }

  if (!canReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Invalid or expired reset link
          </h1>

          <p className="text-sm text-gray-500">
            Please request a new reset password link.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMsg("");
            }}
            className="w-full border rounded-lg px-3 py-2 outline-none"
            placeholder="Enter new password"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setMsg("");
            }}
            className="w-full border rounded-lg px-3 py-2 outline-none"
            placeholder="Confirm new password"
            disabled={loading}
          />
        </div>

        {msg && (
          <p
            className={`text-sm text-center ${
              msgType === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}