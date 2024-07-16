"use client";
import React from "react";
import styles from "./page.module.css";

const ChatDetail = () => {
  return (
    <div className={styles.detailContainer}>
      <div className={styles.header}>
        <h2>Details</h2>
      </div>
      <div className={styles.roomInfo}>
        <h2>Room Name</h2>
        <p>Details about the room...</p>
      </div>
    </div>
  );
};

export default ChatDetail;
