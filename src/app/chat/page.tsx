"use client";

import React, { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";

interface Message {
  sender: string;
  content: string;
  sentTime: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connect = new HubConnectionBuilder()
      .withUrl("https://localhost:5000/hub")
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(connect);

    const startConnection = async () => {
      try {
        console.log("Attempting to connect...");
        await connect.start();
        console.log("Connected!");
        setIsConnected(true);
        connect.on("ReceiveMessage", (sender, content, sentTime) => {
          setMessages((prev) => [...prev, { sender, content, sentTime }]);
        });
        connect.invoke("RetrieveMessageHistory");
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error while connecting to SignalR Hub:", err.message);
        } else {
          console.error("Unknown error while connecting to SignalR Hub:", err);
        }
      }
    };

    startConnection();

    connect.onclose((error) => {
      console.log("Connection closed due to error: ", error);
      setIsConnected(false);
    });

    return () => {
      if (connection) {
        connection.off("ReceiveMessage");
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (connection && newMessage.trim() !== "") {
      try {
        await connection.invoke("SendMessage", { 
          sender: "User", 
          content: newMessage, 
          sentTime: new Date().toISOString() 
        });
        setNewMessage("");
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error while sending message:", err.message);
        } else {
          console.error("Unknown error while sending message:", err);
        }
      }
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.content} <em>{msg.sentTime}</em>
          </div>
        ))}
      </div>
      <input 
        type="text" 
        value={newMessage} 
        onChange={(e) => setNewMessage(e.target.value)} 
        placeholder="Type your message..." 
      />
      <button onClick={handleSendMessage} disabled={!isConnected}>
        Send
      </button>
      {!isConnected && <div>Disconnected from chat.</div>}
    </div>
  );
};

export default Chat;
