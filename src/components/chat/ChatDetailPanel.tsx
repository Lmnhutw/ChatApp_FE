"use client";

import React from "react";
import { useChatContext } from "@/context/ChatContext";
import MemberManagement from "./conversation/MemberManagement";

const ChatDetailPanel = () => {
  const { selectedConversation } = useChatContext();

  return (
    <div className="detailContainer">
      <div className="header">
        <h2>Details</h2>
      </div>
      <div className="roomInfo">
        {selectedConversation ? (
          <>
            <h2>
              {selectedConversation.title ??
                selectedConversation.name ??
                "Conversation"}
            </h2>
            <p>{selectedConversation.members.length} members</p>
            <MemberManagement />
          </>
        ) : (
          <p>Select a conversation.</p>
        )}
      </div>
    </div>
  );
};

export default ChatDetailPanel;
