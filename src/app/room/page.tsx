"use client";

import React, { useState } from "react";
import { useSignalR } from "../../hooks/useSignalR";
import styles from "./page.module.css";

const Room = () => {
  const [fullname, setFullname] = useState("");
  const [room, setRoom] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const { messages, sendMessage, isConnected, joinError, joinRoom } =
    useSignalR(room, fullname);
  const [message, setMessage] = useState("");

  const handleJoinRoom = () => {
    if (fullname.trim() && room.trim()) {
      joinRoom();
      setHasJoined(true);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      console.log("Sending message:", message);
      sendMessage({
        sender: fullname,
        content: message,
        timeStamp: new Date().toISOString(),
        displayTime: "",
      });
      setMessage("");
    }
  };

  if (!hasJoined) {
    return (
      <div className={styles.joinContainer}>
        <h1>Welcome to the F1 ChatApp</h1>
        <input
          type="text"
          placeholder="fullname"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />
        <input
          type="text"
          placeholder="ChatRoom"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join</button>
        {joinError && <p className={styles.error}>{joinError}</p>}
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <h1>ChatRoom</h1>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <strong>{msg.sender}:</strong> {msg.content}{" "}
            <em>{msg.displayTime}</em>
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
