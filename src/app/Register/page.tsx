"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import styles from "./page.module.css";

type RegisterProps = {};

const Register: React.FC<RegisterProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
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
        toast.success(
          "Registration successful! Please check your email to verify.",
          {
            duration: 5000,
            position: "top-right",
            action: {
              label: "X",
              onClick: () => toast.dismiss(),
            },
          }
        );
        setIsModalOpen(true); // Open the modal
      });
    } else {
      toast.error("Registration failed", {
        duration: 5000,
        position: "top-right",
        action: {
          label: "X",
          onClick: () => toast.dismiss(),
        },
      });
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem("USER_KEY");
      const response = await fetch(
        `https://localhost:5000/api/Auth/resend-verification-email/${email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        response.json().then((data) => {
          setMessage(data.Message);
          toast.success("Verification email sent successfully!");
        });
      } else {
        setMessage("Error resending verification email.");
        toast.error("Error resending verification email.");
      }
    } catch (error) {
      setMessage("Error resending verification email.");
      toast.error("Error resending verification email.");
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/"); // Redirect after closing the modal
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Full Name
          <input
            type="text"
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <label className={styles.label}>
          Email
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
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
            required
          />
        </label>

        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
      <div className={styles.footer}>
        <p>
          You already have an account?{" "}
          <span onClick={() => router.push("/")} className={styles.link}>
            Login
          </span>
        </p>
      </div>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              X
            </button>
            <p>Please check your email to verify your account.</p>
            <button onClick={handleResend} disabled={loading}>
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>
            <p>{message}</p>
          </div>
        </div>
      )}
      <Toaster richColors />
    </div>
  );
};

export default Register;
