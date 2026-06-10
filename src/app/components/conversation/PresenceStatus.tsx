"use client";

import type { PresenceStatus as PresenceStatusValue } from "@/types";
import "./conversation.css";

interface PresenceStatusProps {
  status?: PresenceStatusValue;
}

const PresenceStatus = ({ status = "offline" }: PresenceStatusProps) => (
  <span className={`presencePill presence-${status}`}>{status}</span>
);

export default PresenceStatus;
