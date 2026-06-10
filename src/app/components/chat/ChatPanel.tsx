"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useChatContext } from "@/context/ChatContext";
import { getApiErrorMessage } from "@/services";
import MessageActions from "../conversation/MessageActions";
import MessageReactions from "../conversation/MessageReactions";
import ReadReceiptIndicator from "../conversation/ReadReceiptIndicator";
import TypingIndicator from "../conversation/TypingIndicator";
import "./page.css";

const formatMessageTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const ChatPanel: React.FC = () => {
  const {
    state,
    selectedConversation,
    selectedMessages,
    isRealtimeConnected,
    sendMessage,
    sendTyping,
    markMessageRead,
    updateMessage,
    deleteMessage,
    addReaction,
    removeReaction,
  } = useChatContext();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const typingUsers = useMemo(() => {
    if (!state.selectedConversationId) {
      return [];
    }

    return Object.values(
      state.typingByConversation[state.selectedConversationId] ?? {}
    ).filter((typingEvent) => typingEvent.userId !== state.currentUser?.id);
  }, [
    state.currentUser?.id,
    state.selectedConversationId,
    state.typingByConversation,
  ]);

  useEffect(() => {
    const unreadMessages = selectedMessages.filter(
      (item) =>
        item.senderUserId !== state.currentUser?.id &&
        !item.readReceipts?.some(
          (receipt) => receipt.userId === state.currentUser?.id
        )
    );

    unreadMessages.forEach((item) => {
      void markMessageRead(item.id).catch(() => undefined);
    });
  }, [markMessageRead, selectedMessages, state.currentUser?.id]);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    },
    []
  );

  const handleMessageChange = (value: string) => {
    setMessage(value);
    void sendTyping(true).catch(() => undefined);

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      void sendTyping(false).catch(() => undefined);
    }, 1200);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    setIsSending(true);
    try {
      await sendMessage(message);
      setMessage("");
      await sendTyping(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to send message."));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chatContainer">
      <div className="header">
        <h2>
          {selectedConversation?.title ?? selectedConversation?.name ?? "Chat"}
        </h2>
      </div>
      <div className="messageList">
        {!selectedConversation ? (
          <div className="emptyChat">Select a conversation to start chatting.</div>
        ) : state.isLoadingMessages ? (
          <div className="emptyChat">Loading messages...</div>
        ) : selectedMessages.length > 0 ? (
          selectedMessages.map((msg) => {
            const isOwnMessage = msg.senderUserId === state.currentUser?.id;

            return (
              <div
                key={msg.id}
                className={`message ${isOwnMessage ? "ownMessage" : ""}`}
              >
                <div className="messageHeader">
                  <strong>
                    {isOwnMessage ? "You" : msg.sender?.fullName ?? "Unknown user"}
                    :
                  </strong>
                  <em>{formatMessageTime(msg.createdAt)}</em>
                  {msg.editedAt && !msg.deletedAt && <span>Edited</span>}
                </div>
                <div className="messageContent">
                  {msg.deletedAt ? <em>Message deleted</em> : msg.content}
                </div>
                <ReadReceiptIndicator
                  message={msg}
                  currentUserId={state.currentUser?.id}
                />
                <MessageReactions
                  reactions={msg.reactions}
                  currentUserId={state.currentUser?.id}
                  onRemoveReaction={(emoji) =>
                    void removeReaction(msg.id, emoji).catch((error) =>
                      toast.error(
                        getApiErrorMessage(error, "Failed to remove reaction.")
                      )
                    )
                  }
                />
                <MessageActions
                  message={msg}
                  currentUserId={state.currentUser?.id}
                  onAddReaction={(emoji) => addReaction(msg.id, emoji)}
                  onUpdateMessage={(content) =>
                    updateMessage(msg.id, { content })
                  }
                  onDeleteMessage={() => deleteMessage(msg.id)}
                />
              </div>
            );
          })
        ) : (
          <div className="emptyChat">No messages yet.</div>
        )}
        <TypingIndicator typingUsers={typingUsers} />
      </div>
      <div className="inputContainer">
        <input
          type="text"
          value={message}
          onChange={(event) => handleMessageChange(event.target.value)}
          placeholder="Type your message..."
          className="input__chat"
          disabled={!selectedConversation || isSending}
        />
        <button
          onClick={handleSendMessage}
          disabled={!selectedConversation || !message.trim() || isSending}
          className="sendButton"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
      {!isRealtimeConnected && selectedConversation && (
        <div className="disconnected">
          Realtime disconnected. Messages will use REST fallback when possible.
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
