// src/app/components/ChatDetails.tsx
import React from "react";
import styles from "./chatDetails.module.css";

const ChatDetails = () => {
  return (
    <div className={styles.chatDetails}>
      <h2>United Family</h2>
      <p>Rashford is typing...</p>
      <div className={styles.description}>
        <p>
          Hey lads, tough game yesterday. Let&apos;s talk about what went wrong
          and how we can improve.
        </p>
      </div>
      <div className={styles.media}>
        <h3>Media</h3>
        {/* Add media content here */}
      </div>
    </div>
  );
};

export default ChatDetails;
