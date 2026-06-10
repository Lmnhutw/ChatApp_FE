"use client";

import { ChatProvider } from "@/context/ChatContext";
import ChatPanel from "./ChatPanel";

const ChatPage = () => (
  <ChatProvider>
    <ChatPanel />
  </ChatProvider>
);

export default ChatPage;
