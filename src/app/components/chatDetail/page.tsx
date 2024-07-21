// /components/chatDetail/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import "./page.css";

const ChatDetail = () => {
  const [room, setRoom] = useState<{
    name: string;
    participants: number;
  } | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      // Simulating fetching room data, replace with your actual logic
      const dummyRoom = {
        name: "General Chat",
        participants: 5,
      };
      setRoom(dummyRoom);
    };

    fetchRoom();
  }, []);

  return (
    <div className="detailContainer">
      <div className="header">
        <h2>Details</h2>
      </div>
      <div className="roomInfo">
        {room && (
          <>
            <h2>{room.name}</h2>
            <p>{room.participants} participants</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatDetail;
