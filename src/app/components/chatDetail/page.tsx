"use client";
import React from "react";
import "./page.css";

const ChatDetail = () => {
  return (
    <div className="detailContainer">
      <div className="header">
        <h2>Details</h2>
      </div>
      <div className="roomInfo">
        <h2>Room Name</h2>
        <p>Details about the room...</p>
      </div>
    </div>
  );
};

export default ChatDetail;
