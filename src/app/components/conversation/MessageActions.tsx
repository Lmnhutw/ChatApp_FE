"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services";
import type { Guid, MessageResponse } from "@/types";
import "./conversation.css";

interface MessageActionsProps {
  message: MessageResponse;
  currentUserId?: Guid;
  onAddReaction: (emoji: string) => Promise<void>;
  onUpdateMessage: (content: string) => Promise<void>;
  onDeleteMessage: () => Promise<void>;
}

const quickReactions = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}"];

const MessageActions = ({
  message,
  currentUserId,
  onAddReaction,
  onUpdateMessage,
  onDeleteMessage,
}: MessageActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [isWorking, setIsWorking] = useState(false);
  const canEdit = message.senderUserId === currentUserId && !message.deletedAt;

  const runAction = async (action: () => Promise<void>, fallback: string) => {
    setIsWorking(true);
    try {
      await action();
    } catch (error) {
      toast.error(getApiErrorMessage(error, fallback));
    } finally {
      setIsWorking(false);
    }
  };

  const handleSave = async () => {
    if (!draft.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    await runAction(async () => {
      await onUpdateMessage(draft);
      setIsEditing(false);
    }, "Failed to update message.");
  };

  if (message.deletedAt) {
    return null;
  }

  return (
    <div className="messageActions">
      <div className="quickReactions">
        {quickReactions.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="iconButton"
            onClick={() =>
              void runAction(
                () => onAddReaction(emoji),
                "Failed to add reaction."
              )
            }
            disabled={isWorking}
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {canEdit && (
        <div className="ownerActions">
          <button
            type="button"
            className="smallButton"
            onClick={() => setIsEditing((current) => !current)}
            disabled={isWorking}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            className="smallButton dangerButton"
            onClick={() =>
              void runAction(onDeleteMessage, "Failed to delete message.")
            }
            disabled={isWorking}
          >
            Delete
          </button>
        </div>
      )}

      {isEditing && (
        <div className="editMessageForm">
          <input
            className="input__chat"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="button"
            className="smallButton"
            onClick={() => void handleSave()}
            disabled={isWorking}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageActions;
