import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getDeviceInfo } from "../utils/device";

const AuthContext = createContext();

const OTP_PENDING_KEY = "interactive_otp_pending";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [branch, setBranch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [deviceChecking, setDeviceChecking] = useState(true);

  const [error, setError] = useState("");

  const [otpPending, setOtpPendingState] = useState(
    localStorage.getItem(OTP_PENDING_KEY) === "true"
  );

  function setOtpPending(value) {
    if (value) {
      localStorage.setItem(OTP_PENDING_KEY, "true");
      setOtpPendingState(true);
    } else {
      localStorage.removeItem(OTP_PENDING_KEY);
      sessionStorage.removeItem(OTP_PENDING_KEY);
      setOtpPendingState(false);
    }
  }

  async function forceLocalLogout() {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (e) {
      console.error("Sign out error:", e);
    }

    setSession(null);
    setProfile(null);
    setBranch(null);
    setOtpPending(false);
    setDeviceChecking(false);

    localStorage.removeItem(OTP_PENDING_KEY);
    sessionStorage.removeItem(OTP_PENDING_KEY);

    window.location.href = "/login";
  }

  // 1) Load auth session on app start
  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setError(error.message);
      }

      setSession(session);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (!session) {
        setProfile(null);
        setBranch(null);
        setOtpPending(false);
        setDeviceChecking(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2) Global device check whenever app starts with existing session
  // IMPORTANT:
  // Skip this check on /login because Login.jsx already calls start-device-check
  // after manual password login. This prevents duplicate OTP emails.
  useEffect(() => {
    let mounted = true;

    async function checkDeviceOnAppStart() {
      const isLoginPage = window.location.pathname === "/login";

      if (!session?.access_token) {
        if (mounted) {
          setDeviceChecking(false);
        }
        return;
      }

      if (isLoginPage) {
        if (mounted) {
          setDeviceChecking(false);
        }
        return;
      }

      try {
        setDeviceChecking(true);

        const deviceInfo = getDeviceInfo();

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-device-check`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(deviceInfo),
          }
        );

        const result = await res.json();

        if (!mounted) return;

        if (!res.ok) {
          console.error("Device check failed:", result);
          setOtpPending(true);
          return;
        }

        if (result.trusted) {
          setOtpPending(false);
          return;
        }

        if (result.otp_required) {
          setOtpPending(true);
          return;
        }

        console.error("Unexpected device check response:", result);
        setOtpPending(true);
      } catch (err) {
        console.error("Device startup check error:", err);

        if (mounted) {
          setOtpPending(true);
        }
      } finally {
        if (mounted) {
          setDeviceChecking(false);
        }
      }
    }

    checkDeviceOnAppStart();

    return () => {
      mounted = false;
    };
  }, [session?.access_token]);

  // 3) Load profile + branch whenever session changes
  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!session?.user?.id) {
        if (!mounted) return;

        setProfile(null);
        setBranch(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setError("");

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
          force_logout,
          branches (
            id,
            branch_code,
            branch_name,
            branch_email,
            branch_contact_no,
            company_name,
            address,
            branch_bank_accounts (
              id,
              bank_name,
              account_name,
              account_number
            )
          )
        `)
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setProfile(null);
        setBranch(null);
      } else {
        if (data?.force_logout === true || data?.status !== "active") {
          await forceLocalLogout();
          return;
        }

        setProfile(data);
        setBranch(data?.branches ?? null);

        await supabase
          .from("profiles")
          .update({ force_logout: false })
          .eq("id", session.user.id);
      }

      setProfileLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [session]);

  // 4) Watch own profile for forced logout in realtime
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`profile-watch-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${session.user.id}`,
        },
        async (payload) => {
          const newRow = payload.new;

          if (newRow?.force_logout === true || newRow?.status !== "active") {
            await forceLocalLogout();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  async function signOut() {
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      setError(error.message);
      return;
    }

    setSession(null);
    setProfile(null);
    setBranch(null);
    setOtpPending(false);
    setDeviceChecking(false);

    localStorage.removeItem(OTP_PENDING_KEY);
    sessionStorage.removeItem(OTP_PENDING_KEY);

    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        branch,

        loading,
        profileLoading,
        deviceChecking,

        error,
        signOut,

        otpPending,
        setOtpPending,

        isAuthenticated: !!session,
        isAdmin: profile?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}