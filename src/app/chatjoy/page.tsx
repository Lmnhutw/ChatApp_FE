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
import { authService } from "@/services";

const ChatJoy = () => {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
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
