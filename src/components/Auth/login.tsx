"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
import { toast, Toaster } from "sonner";
import { authService, getApiErrorMessage } from "@/services";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    const loginPromise = authService.login({
      email: email.trim(),
      password,
    });

    toast.promise(loginPromise, {
      loading: "Logging in...",
      success: "Login successful!",
      error: (error) =>
        getApiErrorMessage(
          error,
          "Login failed. Please check your email and password."
        ),
    });

    try {
      await loginPromise;
      router.push("/chatjoy");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">
        Welcome to ChatApp <br />
        Login
      </h1>
      {/* <h2 className="title2">Login </h2> */}
      <form className="form" onSubmit={handleSubmit}>
        <label className="label">
          Email
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className="label">
          Password
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="footer">
        <p>
          You don&apos;t have an account?{" "}
          <span onClick={() => router.push("/register")} className="link">
            Sign Up
          </span>
        </p>
      </div>
      <Toaster richColors expand={true} closeButton />
    </div>
  );
};

export default Login;
