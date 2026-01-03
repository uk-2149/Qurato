"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(e: React.FormEvent<HTMLButtonElement>) => {
    try {
        e.preventDefault();

        const res = await fetch("api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        })

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Signup error:", errorText);
            return;
        }

        const data = await res.json();
        console.log("Signup successful:", data);

        const result = await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: "/",
        });

        if (result?.error) {
            alert(`Error in login`);
            console.log("Error: ", result?.error);
        } else {
            setTimeout(() => (window.location.href = "/"), 100);
        }
    } catch (error) {
      console.log(error);
      alert("An unexpected error occurred");
    }
  }

  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d10] p-4">
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-xl">
        
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white">
            Create account
          </h1>
          <p className="text-zinc-400 mt-2">
            Start your learning journey
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <div>
            <label className="text-sm text-zinc-400">Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
            onClick={handleSubmit}
          >
            Create account
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-zinc-700 flex-1" />
          <span className="text-zinc-500 text-sm">or</span>
          <div className="h-px bg-zinc-700 flex-1" />
        </div>

        {/* Google Signup */}
        <button
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition"
          onClick={handleGoogleSignup}
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
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
