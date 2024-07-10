"use client";

import React, { useState } from "react";
import { useSignalR } from "../../hooks/useSignalR";
import styles from "./page.module.css";

const Room: React.FC = () => {
  const { messages, sendMessage, isConnected } = useSignalR();
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      sendMessage({
        sender: "User",
        content: message,
        sentTime: new Date().toISOString(),
      });
      setMessage("");
    }
  };

  return (
    <div className={styles.roomContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <strong>{msg.sender}:</strong> {msg.content} <em>{msg.sentTime}</em>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className={styles.input}
      />
      <button
        onClick={handleSendMessage}
        disabled={!isConnected}
        className={styles.button}
      >
        Send
      </button>
      {!isConnected && (
        <div className={styles.disconnected}>Disconnected from chat.</div>
      )}
    </div>
  );
};

export default Room;
