// src/app/components/chat/Chat.tsx

import React, { useState } from "react";
import { useSignalR } from "../../../hooks/useSignalR"; // Adjust the import path as necessary
import styles from "./page.module.css"; // Import the module CSS

const Chat = () => {
  const { messages, sendMessage, isConnected } = useSignalR();
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      sendMessage({
        sender: "User",
        content: newMessage,
        sentTime: new Date().toISOString(),
      });
      setNewMessage("");
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <strong>{msg.sender}:</strong> {msg.content} <em>{msg.sentTime}</em>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
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

export default Chat;
