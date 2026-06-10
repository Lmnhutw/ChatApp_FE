"use client";

import type { TypingChangedEvent } from "@/types";

interface TypingIndicatorProps {
  typingUsers: TypingChangedEvent[];
}

const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <div className="typingIndicator">
      {typingUsers
        .map((typingEvent) => typingEvent.user?.fullName ?? "Someone")
        .join(", ")}{" "}
      typing...
    </div>
  );
};

export default TypingIndicator;
