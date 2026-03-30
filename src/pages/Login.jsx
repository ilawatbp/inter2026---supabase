import { useState } from "react";
import logo from "../assets/logo.png";
import lamp from "../assets/bg-lamp.png";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  if (session) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <div className="min-h-dvh w-full flex justify-center items-center flex-col">
      <img src={lamp} alt="" className="fixed z-0 w-[250px] right-10 top-0"/>
      <div className="w-full z-20 px-10 h-24 mb-auto flex items-center"> 
        <img src={logo} alt="ilaw atbp" className="w-[150px]" />
      </div>
      <div className="w-1/3 h-[600px] flex flex-col">
        <h1 className="mb-10 text-4xl font-bold">log in</h1>

        <form onSubmit={handleSubmit} className=" border border-black rounded-3xl flex-1 px-8 py-10 flex flex-col justify-start items-center gap-4">
            <p className="mr-auto">Interactive</p>
            <input
              className="px-10 py-4 border border-black rounded-full w-full"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
            className="px-10 py-4 border border-black rounded-full w-full"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          <button type="submit" disabled={loading} className="mt-auto border border-black w-full h-16 rounded-full 
                                                            hover:bg-[#3cb54b] hover:text-white hover:border-none
                                                            transition-colors duration-300 ease-in-out
                                                            ">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="ml-auto mt-2 cursor-pointer hover:font-bold">forgot password?</p>
      </div>

      {errorMsg && <p>{errorMsg}</p>}
      <h5 className="mt-auto text-gray-300">version - 3.0</h5>
    </div>
  );
}