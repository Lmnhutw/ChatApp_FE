"use client";

import { ChatProvider } from "@/context/ChatContext";
import ChatDetailPanel from "./ChatDetailPanel";

const ChatDetailPage = () => (
  <ChatProvider>
    <ChatDetailPanel />
  </ChatProvider>
);

export default ChatDetailPage;
