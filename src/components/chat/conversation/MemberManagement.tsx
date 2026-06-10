"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services";
import { useChatContext } from "@/context/ChatContext";
import type { Guid, UserProfile } from "@/types";
import PresenceStatus from "./PresenceStatus";
import UserSearch from "./UserSearch";

const MemberManagement = () => {
  const {
    state,
    selectedConversation,
    addConversationMember,
    removeConversationMember,
    leaveSelectedConversation,
    blockUser,
    unblockUser,
  } = useChatContext();
  const [isAddingMember, setIsAddingMember] = useState(false);

  if (!selectedConversation) {
    return <p>Select a conversation.</p>;
  }

  const blockedUserIds = new Set(
    state.blockedUsers.map((userBlock) => userBlock.blockedUserId)
  );

  const memberIds = selectedConversation.members.map((member) => member.userId);

  const handleAddMember = async (user: UserProfile) => {
    setIsAddingMember(true);
    try {
      await addConversationMember(user.id);
      toast.success(`${user.fullName} added.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add member."));
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: Guid, fullName: string) => {
    try {
      await removeConversationMember(userId);
      toast.success(`${fullName} removed.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove member."));
    }
  };

  const handleBlockToggle = async (userId: Guid, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await unblockUser(userId);
        toast.success("User unblocked.");
      } else {
        await blockUser(userId);
        toast.success("User blocked.");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update block state."));
    }
  };

  const handleLeaveConversation = async () => {
    try {
      await leaveSelectedConversation();
      toast.success("Left conversation.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to leave conversation."));
    }
  };

  return (
    <div className="memberManagement">
      <div className="detailSection">
        <div className="detailSectionHeader">
          <h3>Members</h3>
          <button
            type="button"
            className="smallButton dangerButton"
            onClick={() => void handleLeaveConversation()}
          >
            Leave
          </button>
        </div>
        <div className="memberList">
          {selectedConversation.members.map((member) => {
            const presence = state.presenceByUserId[member.userId];
            const isCurrentUser = member.userId === state.currentUser?.id;
            const isBlocked = blockedUserIds.has(member.userId);

            return (
              <div key={member.userId} className="memberItem">
                <div className="memberPrimary">
                  <span>{member.user.fullName}</span>
                  <PresenceStatus status={presence?.status} />
                </div>
                <div className="memberActions">
                  {!isCurrentUser && (
                    <>
                      <button
                        type="button"
                        className="smallButton"
                        onClick={() =>
                          void handleBlockToggle(member.userId, isBlocked)
                        }
                      >
                        {isBlocked ? "Unblock" : "Block"}
                      </button>
                      {selectedConversation.type === "group" && (
                        <button
                          type="button"
                          className="smallButton dangerButton"
                          onClick={() =>
                            void handleRemoveMember(
                              member.userId,
                              member.user.fullName
                            )
                          }
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedConversation.type === "group" && (
        <div className="detailSection">
          <h3>Add member</h3>
          <UserSearch
            label="Find a user"
            excludeUserIds={memberIds}
            onSelectUser={(user) => void handleAddMember(user)}
          />
          {isAddingMember && <p className="mutedText">Adding member...</p>}
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
