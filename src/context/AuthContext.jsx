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
          branches (*)
        `)
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setProfile(null);
        setBranch(null);
      } else {
        setProfile(data);
        setBranch(data?.branches ?? null);
      }

      setProfileLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [session]);

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    setSession(null);
    setProfile(null);
    setBranch(null);
    setOtpPending(false);
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