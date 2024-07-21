"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";

interface Props {}

const ResendVerificationPopup: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem("USER_KEY");
      if (!email) {
        throw new Error("User email not found in local storage.");
      }

      const response = await axios.post(
        `https://localhost:5000/api/Auth/resend-verification-email/${email}`,
        {}
      );

      if (response.status === 200) {
        setMessage(response.data.Message);
        toast.success("Verification email sent successfully!");
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
