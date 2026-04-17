import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

const OTP_PENDING_KEY = "interactive_otp_pending";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpPending, setOtpPendingState] = useState(
    sessionStorage.getItem(OTP_PENDING_KEY) === "true"
  );

  function setOtpPending(value) {
    if (value) {
      sessionStorage.setItem(OTP_PENDING_KEY, "true");
      setOtpPendingState(true);
    } else {
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

    localStorage.clear();
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
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2) Load profile + branch whenever session changes
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
        // force logout immediately if admin flagged this user
        if (data?.force_logout === true || data?.status !== "active") {
          await forceLocalLogout();
          return;
        }

        setProfile(data);
        setBranch(data?.branches ?? null);

        // optional: reset force_logout after successful profile load
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

  // 3) Watch own profile for forced logout in realtime
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

    localStorage.clear();
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