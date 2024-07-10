"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ResendVerificationPopup from "./resendVerificationPopup/page";

type RegisterProps = {};

const Register: React.FC<RegisterProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("https://localhost:5000/api/Auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (response.ok) {
      response.json().then((data) => {
        localStorage.setItem("USER_KEY", data.email);
      });
      setPopupOpen(true);
    } else {
      console.error("Registration failed");
    }
  };

  const handleClosePopup = async () => {
    const email = localStorage.getItem("USER_KEY");

    const response = await fetch(
      `https://localhost:5000/api/Auth/GetUserEmail/${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      response.json().then((data) => {
        setPopupOpen(false);
        router.push("/");
      });
    } else {
      console.error("Registration failed");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <label className={styles.label}>Full Name</label>
          <input
            type="text"
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
        </label>
        <label>
          <label className={styles.label}>Email</label>
          <input
            type="text"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          <label className={styles.label}> Password </label>
          <input
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
      <div className={styles.footer}>
        <p>
          Already have an account?{" "}
          <span onClick={() => router.push("/")} className={styles.link}>
            Login
          </span>
        </p>
      </div>
      <ResendVerificationPopup
        open={popupOpen}
        onClose={handleClosePopup}
        userEmail={email}
      />
    </div>
  );
};

export default Register;
