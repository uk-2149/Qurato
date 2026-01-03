"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    try {
        const res = await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: "/dashboard",
        });

        if (res?.error) {
            alert(`Error in login`);
            console.log("Error: ", res?.error);
        }
    } catch (error) {
      console.log(error);
      alert("An unexpected error occurred");
    }
  };

  const handleGoogleLogIn = () => {
    signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d10] p-4">
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-xl">
        
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white">
            Welcome back
          </h1>
          <p className="text-zinc-400 mt-2">
            Login to continue learning
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium"
            onClick={handleLogin}
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-zinc-700 flex-1" />
          <span className="text-zinc-500 text-sm">or</span>
          <div className="h-px bg-zinc-700 flex-1" />
        </div>

        {/* Google Login */}
        <button
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition"
          onClick={handleGoogleLogIn}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-center text-zinc-400 text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
