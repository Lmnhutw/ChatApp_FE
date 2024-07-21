"use client";
import React, { useState } from "react";
import "./page.css";

interface Message {
  sender: string;
  content: string;
  timeStamp: string;
  displayTime: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        sender: "User", // Replace with actual sender
        content: message,
        timeStamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="chatContainer">
      <div className="header">
        <h2>Chat</h2>
      </div>
      <div className="messageList">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}:</strong> {msg.content}{" "}
            <em>{msg.displayTime}</em>
          </div>
        ))}
      </div>
      <div className="inputContainer">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="input__chat"
        />
        <button
          onClick={handleSendMessage}
          disabled={!isConnected}
          className="sendButton"
        >
          Send
        </button>
      </div>
      {!isConnected && (
        <div className="disconnected">Disconnected from chat.</div>
      )}
    </div>
  );
};

export default Chat;
