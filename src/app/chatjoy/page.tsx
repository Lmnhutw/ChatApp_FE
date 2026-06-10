"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import ChatDetailPanel from "../components/chatDetail/ChatDetailPanel";
import ContactListPanel from "../components/contactList/ContactListPanel";
import NavigationPanel from "../components/navigationPanel/page";
import ChatPanel from "../components/chat/ChatPanel";
import "./page.css";
import { toast } from "sonner";
import { authService } from "@/services";
import { ChatProvider } from "@/context/ChatContext";

const ChatJoy = () => {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("You have to login first!");
      router.push("/");
    }
  }, [router]);

  return (
    <ChatProvider>
      <div className="chatJoyContainer">
        <NavigationPanel />
        <ContactListPanel />
        <ChatPanel />
        <ChatDetailPanel />
      </div>
    </ChatProvider>
  );
};

export default ChatJoy;
