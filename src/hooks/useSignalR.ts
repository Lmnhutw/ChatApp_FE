import { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";

interface Message {
  sender: string;
  content: string;
  timeStamp: string;
  displayTime: string;
}

const useSignalR = (chatjoy: string, fullname: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const connect = new HubConnectionBuilder()
      .withUrl("https://localhost:5000/hub")
      .configureLogging(LogLevel.Information)
      .build();

    connect.on("ReceiveMessage", (message: Message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    connect.on("UserJoined", (user: string) => {
      console.log("User joined:", user);
      const joinTime = new Date().toISOString();
      const displayTime = new Date(joinTime).toLocaleTimeString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "System",
          content: `${user} has joined the chatjoy`,
          timeStamp: joinTime,
          displayTime: displayTime
        }
      ]);
    });

    connect
      .start()
      .then(() => {
        console.log("Connected to the SignalR server!");
        setIsConnected(true);
        setConnection(connect);
      })
      .catch((error) => console.error("SignalR Connection Error: ", error));

    return () => {
      connect.stop().then(() => console.log("Disconnected from the SignalR server."));
    };
  }, []);

  const joinRoom = () => {
    if (connection) {
      connection.invoke("JoinRoom", { roomName: chatjoy, FullName: fullname })
        .then(() => {
          setJoinError(null);
          console.log("Joined chatjoy successfully");
        })
        .catch((error: any) => {
          console.error("SignalR JoinRoom Error: ", error);
          setJoinError("Failed to join the chatjoy. Please check the chatjoy Name and try again.");
        });
    }
  };

  const sendMessage = (message: Message) => {
    if (connection) {
      const timestamp = new Date().toISOString();

      connection.invoke("SendMessage", {
        roomName: chatjoy,
        FullName: message.sender,
        Content: message.content,
        Timestamp: timestamp
      })
        .then(() => {
          const displayTime = new Date(timestamp).toLocaleTimeString('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          console.log("Message sent:", message);
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...message, timeStamp: timestamp, displayTime: displayTime }
          ]);
        })
        .catch((error: any) => console.error("SignalR SendMessage Error: ", error));
    }
  };

  return { messages, sendMessage, isConnected, joinError, joinRoom, connection };
};

export { useSignalR };
