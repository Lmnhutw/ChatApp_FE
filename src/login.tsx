"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
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

    if (response.ok) {
      router.push("/room");
    } else {
      console.error("Login failed");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome to ChatApp <br />
        Login
      </h1>
      {/* <h2 className={styles.title2}>Login </h2> */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Email
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button type="submit" className={styles.button}>
          Login
        </button>
      </form>
      <div className={styles.footer}>
        <p>
          You don&apos;t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className={styles.link}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
