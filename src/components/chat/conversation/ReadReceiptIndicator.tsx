"use client";

import type { MessageResponse } from "@/types";

interface ReadReceiptIndicatorProps {
  message: MessageResponse;
  currentUserId?: string;
}

const ReadReceiptIndicator = ({
  message,
  currentUserId,
}: ReadReceiptIndicatorProps) => {
  if (message.senderUserId !== currentUserId) {
    return null;
  }

  const readCount = message.readReceipts?.filter(
    (receipt) => receipt.userId !== currentUserId
  ).length;

  return (
    <span className="readReceipt">
      {readCount ? `Read by ${readCount}` : "Sent"}
    </span>
  );
};

export default ReadReceiptIndicator;
