"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import ChatDetail from "../components/chatDetail/page";
import ContactList from "../components/contactList/page";
import NavigationPanel from "../components/navigationPanel/page";
import Chat from "../components/chat/page";
import "./page.css";
import { toast } from "sonner";

const ChatJoy = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You have to login first!");
      router.push("/");
    }
  }, [router]);

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
