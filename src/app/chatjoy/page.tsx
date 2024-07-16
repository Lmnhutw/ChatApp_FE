"use client";

import React from "react";
import ChatDetail from "../components/chatDetail/page";
import ContactList from "../components/contactList/page";
import NavigationPanel from "../components/navigationPanel/page";
import Chat from "../components/chat/page";
import styles from "./page.module.css";

const ChatJoy = () => {
  return (
    <div className={styles.chatJoyContainer}>
      <NavigationPanel />
      <ContactList />
      <Chat />
      <ChatDetail />
    </div>
  );
};

export default ChatJoy;
