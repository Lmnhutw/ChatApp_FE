"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { useChatContext } from "@/context/ChatContext";
import type { ConversationResponse } from "@/types";
import ConversationCreator from "./conversation/ConversationCreator";

const getConversationTitle = (conversation: ConversationResponse): string => {
  const memberNames = conversation.members
    .map((member) => member.user.fullName)
    .filter(Boolean)
    .join(", ");

  return (
    conversation.title ??
    conversation.name ??
    (memberNames || "Untitled conversation")
  );
};

const ContactListPanel = () => {
  const { state, selectConversation } = useChatContext();
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  return (
    <div className="contactListContainer">
      <div className="header">
        <h2>Conversations</h2>
      </div>
      <div className="buttonContainer">
        <button
          className="sendButtonRequest"
          onClick={() => setIsDirectModalOpen(true)}
        >
          Direct
        </button>
        <button
          className="sendButtonRequest"
          onClick={() => setIsGroupModalOpen(true)}
        >
          Group
        </button>
      </div>
      {state.isLoadingConversations ? (
        <div className="noRooms">Loading conversations...</div>
      ) : state.conversations.length > 0 ? (
        state.conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={`contactItem ${
              state.selectedConversationId === conversation.id ? "selected" : ""
            }`}
            onClick={() => void selectConversation(conversation.id)}
          >
            <span>{getConversationTitle(conversation)}</span>
            {conversation.unreadCount ? (
              <span className="unreadCount">{conversation.unreadCount}</span>
            ) : null}
          </button>
        ))
      ) : (
        <div className="noRooms">No conversations available.</div>
      )}
      {isDirectModalOpen && (
        <ConversationCreator
          mode="direct"
          onClose={() => setIsDirectModalOpen(false)}
        />
      )}
      {isGroupModalOpen && (
        <ConversationCreator
          mode="group"
          onClose={() => setIsGroupModalOpen(false)}
        />
      )}
      <Toaster richColors expand={true} closeButton />
    </div>
  );
};

export default ContactListPanel;
