// src/app/hooks/useSignalR.ts

import { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

interface Message {
  sender: string;
  content: string;
  sentTime: string;
}

const useSignalR = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connect = new HubConnectionBuilder()
      .withUrl("https://localhost:5000/hub")
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(connect);

    connect
      .start()
      .then(() => {
        console.log("Connected to the SignalR server!");
        setIsConnected(true);
        connect.on("ReceiveMessage", (message: Message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });
      })
      .catch((error) => console.error("SignalR Connection Error: ", error));

    return () => {
      connect
        .stop()
        .then(() => console.log("Disconnected from the SignalR server."));
    };
  }, []);

  const sendMessage = (message: Message) => {
    if (connection) {
      connection
        .invoke("SendMessage", message)
        .catch((error: any) =>
          console.error("SignalR SendMessage Error: ", error)
        );
    }
  };

  return { messages, sendMessage, isConnected };
};

export { useSignalR };
