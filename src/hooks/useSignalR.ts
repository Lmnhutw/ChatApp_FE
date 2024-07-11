import { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

interface Message {
  sender: string;
  content: string;
  timeStamp: string;
}

const useSignalR = (room: string, fullname: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

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

        connect.on("UserJoined", (user: string) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "System", content: `${user} has joined the room`, timeStamp: new Date().toISOString() }
          ]);
        });

        connect.invoke("JoinRoom", {RoomName: room, FullName: fullname })
          .then(() => setJoinError(null))
          .catch((error: any) => {
            console.error("SignalR JoinRoom Error: ", error);
            setJoinError("Failed to join the room. Please check the room Name and try again.");
          });
      })
      .catch((error) => console.error("SignalR Connection Error: ", error));

    return () => {
      connect
        .stop()
        .then(() => console.log("Disconnected from the SignalR server."));
    };
  }, [room, fullname]);

  const sendMessage = (message: Message) => {
    if (connection) {
      connection
        .invoke("SendMessage", room, message.sender, message.content)
        .catch((error: any) =>
          console.error("SignalR SendMessage Error: ", error)
        );
    }
  };

  return { messages, sendMessage, isConnected, joinError };
};

export { useSignalR };
