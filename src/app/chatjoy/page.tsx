"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatDetailPanel from "@/components/chat/ChatDetailPanel";
import ContactListPanel from "@/components/chat/ContactListPanel";
import NavigationPanel from "@/components/chat/NavigationPanel";
import ChatPanel from "@/components/chat/ChatPanel";
import "./page.css";
import "./chat-ui.css";
import { toast } from "sonner";
import { authService } from "@/services";
import { ChatProvider } from "@/context/ChatContext";

const ChatJoy = () => {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error("You have to login first!");
      router.push("/");
      setIsCheckingAuth(false);
      return;
    }

    setIsAllowed(true);
    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return <div className="chatJoyLoading">Loading chat...</div>;
  }

  if (!isAllowed) {
    return null;
  }

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
