"use client";

import { ChatProvider } from "@/context/ChatContext";
import ContactListPanel from "./ContactListPanel";

const ContactListPage = () => (
  <ChatProvider>
    <ContactListPanel />
  </ChatProvider>
);

export default ContactListPage;
