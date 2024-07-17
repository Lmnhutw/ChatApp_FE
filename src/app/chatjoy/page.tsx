"use client";

import React from "react";
import ChatDetail from "../components/chatDetail/page";
import ContactList from "../components/contactList/page";
import NavigationPanel from "../components/navigationPanel/page";
import Chat from "../components/chat/page";
import "./page.css";

const ChatJoy = () => {
  return (
    <div className="chatJoyContainer">
      <NavigationPanel />
      <ContactList />
      <Chat />
      <ChatDetail />
    </div>
  );
};

export default ChatJoy;
