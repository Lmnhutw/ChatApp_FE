// components/ResendVerificationPopup.tsx

import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface resendVerificationPopupProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
}

const ResendVerificationPopup: React.FC<resendVerificationPopupProps> = ({
  open,
  onClose,
  userEmail,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  console.log(open);

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/Auth/resend-verification-email", {
        email: userEmail,
      });
      setMessage(response.data.Message);
    } catch (error) {
      setMessage("Error resending verification email.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Email Verification</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please check your email to verify your account. If you did not receive
          the email, click the button below to resend it.
        </DialogContentText>
        {message && <DialogContentText>{message}</DialogContentText>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button onClick={handleResend} color="primary" disabled={loading}>
          {loading ? "Sending..." : "Resend Email"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResendVerificationPopup;
