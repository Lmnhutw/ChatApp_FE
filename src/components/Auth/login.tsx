"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
import { toast, Toaster } from "sonner";

type Login = {};

const Login: React.FC<Login> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("https://localhost:5000/api/Auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    toast.promise(
      async () => {
        // Simulate a login process with a delay (replace with your actual login logic)
        await new Promise((resolve) => setTimeout(resolve, 600)); // Adjust delay as needed

        // Check for successful response status
        if (response.ok) {
          return true; // Return true for successful login
        } else {
          throw new Error("Login failed"); // Throw an error for failed login
        }
      },
      {
        loading: "Logging in...",
        success: () => "Login successful!",
        error: (error) => {
          console.error("Login failed:", error);
          return "Login failed. Please check your email and password.";
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("USER_ID", data.user.id);
      localStorage.setItem("FULL_NAME", data.user.fullName);
      router.push("/chatjoy");
    } else {
      console.error("Login failed:", await response.text());
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
        <button type="submit" className="button">
          Login
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
