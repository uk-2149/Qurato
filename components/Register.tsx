"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RegisterProps {
  callbackUrl?: string;
}

export default function RegisterPage({ callbackUrl = "/dashboard" }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async(e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(true);

    // Simple frontend validation before even hitting the API
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res?.ok) {
        toast.error(data.error || "Signup failed");
        setIsLoading(false);
        return;
      }

      toast.success("Account created! Logging you in...");

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        toast.error("Account created, but automatic login failed. Please login manually.");
        router.push(`/login?callbackUrl=${callbackUrl}`);
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
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
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed transition text-white font-medium flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? "Creating account..." : "Create account"}
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
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
          )}
          {isLoading ? "Signing up..." : "Continue with Google"}
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
