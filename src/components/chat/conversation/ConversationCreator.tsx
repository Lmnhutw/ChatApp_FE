"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services";
import { useChatContext } from "@/context/ChatContext";
import type { Guid, UserProfile } from "@/types";
import UserSearch from "./UserSearch";

interface ConversationCreatorProps {
  mode: "direct" | "group";
  onClose: () => void;
}

const withoutUser = (users: UserProfile[], userId: Guid): UserProfile[] =>
  users.filter((user) => user.id !== userId);

const ConversationCreator = ({ mode, onClose }: ConversationCreatorProps) => {
  const { state, createDirectConversation, createGroupConversation } =
    useChatContext();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedUserIds = selectedUsers.map((user) => user.id);

  const handleSelectUser = (user: UserProfile) => {
    if (mode === "direct") {
      setSelectedUsers([user]);
      return;
    }

    setSelectedUsers((currentUsers) =>
      currentUsers.some((currentUser) => currentUser.id === user.id)
        ? currentUsers
        : [...currentUsers, user]
    );
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Select at least one user.");
      return;
    }

    if (mode === "group" && !groupName.trim()) {
      toast.error("Group name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "direct") {
        await createDirectConversation({
          participantUserId: selectedUsers[0].id,
        });
      } else {
        await createGroupConversation({
          name: groupName.trim(),
          memberUserIds: selectedUserIds,
        });
      }

      toast.success(
        mode === "direct" ? "Conversation created." : "Group created."
      );
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create conversation."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal">
      <div className="modalContent">
        <h3>
          {mode === "direct"
            ? "Start Direct Conversation"
            : "Create Group Conversation"}
        </h3>

        {mode === "group" && (
          <label className="fieldLabel">
            Group name
            <input
              type="text"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Team chat"
              className="input"
            />
          </label>
        )}

        <UserSearch
          label={mode === "direct" ? "Find a person" : "Add members"}
          excludeUserIds={state.currentUser?.id ? [state.currentUser.id] : []}
          selectedUsers={selectedUsers}
          onSelectUser={handleSelectUser}
          onRemoveUser={(userId) =>
            setSelectedUsers((currentUsers) => withoutUser(currentUsers, userId))
          }
        />

        <div className="buttonContainer">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="sendButtonConfirm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="sendButtonConfirm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationCreator;
