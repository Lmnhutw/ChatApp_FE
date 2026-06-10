"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import "./page.css";
import { authService, getApiErrorMessage } from "@/services";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Full name, email, and password are required.");
      return;
    }

    setIsRegistering(true);

    try {
      await authService.register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      toast.success(
        "Registration successful! Please check your email to verify.",
        {
          duration: 5000,
          position: "top-right",
        }
      );
      setIsModalOpen(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Registration failed."), {
        duration: 5000,
        position: "top-right",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const verificationEmail =
        authService.getPendingVerificationEmail() ?? email.trim();

      if (!verificationEmail) {
        throw new Error("No verification email is available.");
      }

      const response = await authService.resendVerificationEmail(verificationEmail);
      setMessage(response.message ?? response.Message ?? "Verification email sent.");
      toast.success("Verification email sent successfully!");
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        "Error resending verification email."
      );
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/"); // Redirect after closing the modal
  };

  return (
    <div className="container">
      <h1 className="title">Register</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label">
          Full Name
          <input
            type="text"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <label className="label">
          Email
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
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
            required
          />
        </label>

        <button type="submit" className="button" disabled={isRegistering}>
          {isRegistering ? "Registering..." : "Register"}
        </button>
      </form>
      <div className="footer">
        <p>
          You already have an account?{" "}
          <span onClick={() => router.push("/")} className="link">
            Login
          </span>
        </p>
      </div>
      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modal">
            <button className="closeButton" onClick={handleCloseModal}>
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
    </div>
  );
};

export default Register;
