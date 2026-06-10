"use client";

import type { MessageReaction } from "@/types";
import "./conversation.css";

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId?: string;
  onRemoveReaction: (emoji: string) => void;
}

const MessageReactions = ({
  reactions,
  currentUserId,
  onRemoveReaction,
}: MessageReactionsProps) => {
  if (reactions.length === 0) {
    return null;
  }

  const groupedReactions = reactions.reduce<Record<string, MessageReaction[]>>(
    (groups, reaction) => {
      return {
        ...groups,
        [reaction.emoji]: [...(groups[reaction.emoji] ?? []), reaction],
      };
    },
    {}
  );

  return (
    <div className="reactionList">
      {Object.entries(groupedReactions).map(([emoji, grouped]) => {
        const hasReacted = grouped.some(
          (reaction) => reaction.userId === currentUserId
        );

        return (
          <button
            key={emoji}
            type="button"
            className={`reactionPill ${hasReacted ? "selectedReaction" : ""}`}
            onClick={() => hasReacted && onRemoveReaction(emoji)}
            aria-label={`${emoji} reaction count ${grouped.length}`}
          >
            <span>{emoji}</span>
            <span>{grouped.length}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MessageReactions;
