"use client";
import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { authService, getApiErrorMessage } from "@/services";

const ResendVerificationPopup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setLoading(true);
    try {
      const email = authService.getPendingVerificationEmail();
      if (!email) {
        throw new Error("Verification email is not available.");
      }

      const response = await authService.resendVerificationEmail(email);
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

  return (
    <div>
      <button onClick={handleResend} disabled={loading}>
        {loading ? "Sending..." : "Resend Verification Email"}
      </button>
      <p>{message}</p>
      <Toaster richColors />
    </div>
  );
};

export default ResendVerificationPopup;
