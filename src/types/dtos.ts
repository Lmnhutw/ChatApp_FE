export type Guid = string;

export type ConversationType = "direct" | "group";

export type ConversationRole = "owner" | "admin" | "member";

export type MessageStatus = "sent" | "delivered" | "read" | "deleted";

export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface UserProfile {
  id: Guid;
  email: string;
  userName?: string | null;
  fullName: string;
  profilePic?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  isEmailConfirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  userName?: string;
  profilePic?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface BlockUserRequest {
  blockedUserId: Guid;
  reason?: string;
}

export interface UserBlock {
  id: Guid;
  blockerUserId: Guid;
  blockedUserId: Guid;
  blockedUser?: UserProfile;
  reason?: string | null;
  createdAt: string;
}

export interface UserPresence {
  userId: Guid;
  status: PresenceStatus;
  lastSeenAt?: string | null;
  isTyping?: boolean;
  conversationId?: Guid | null;
}

export interface ConversationMember {
  conversationId: Guid;
  userId: Guid;
  role: ConversationRole;
  joinedAt: string;
  lastReadMessageId?: Guid | null;
  mutedUntil?: string | null;
}

export interface ConversationMemberResponse extends ConversationMember {
  user: UserProfile;
  presence?: UserPresence | null;
}

export interface ConversationResponse {
  id: Guid;
  type: ConversationType;
  title?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  createdByUserId?: Guid | null;
  createdAt: string;
  updatedAt?: string | null;
  members: ConversationMemberResponse[];
  lastMessage?: MessageResponse | null;
  unreadCount?: number;
  isMuted?: boolean;
}

export interface CreateDirectConversationRequest {
  participantUserId: Guid;
}

export interface CreateGroupConversationRequest {
  name: string;
  memberUserIds: Guid[];
  avatarUrl?: string | null;
}

export interface AddConversationMemberRequest {
  userId: Guid;
  role?: ConversationRole;
}

export interface MessageAttachment {
  id: Guid;
  messageId?: Guid | null;
  fileName: string;
  contentType: string;
  url: string;
  sizeInBytes: number;
  createdAt: string;
}

export interface CreateAttachmentRequest {
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  url: string;
}

export interface MessageReaction {
  id: Guid;
  messageId: Guid;
  userId: Guid;
  emoji: string;
  createdAt: string;
  user?: UserProfile;
}

export interface AddReactionRequest {
  messageId: Guid;
  emoji: string;
}

export interface MessageReadReceipt {
  id: Guid;
  messageId: Guid;
  userId: Guid;
  readAt: string;
  user?: UserProfile;
}

export interface MessageDeletedEvent {
  conversationId: Guid;
  messageId: Guid;
  deletedByUserId?: Guid;
  deletedAt: string;
}

export interface TypingChangedEvent {
  conversationId: Guid;
  userId: Guid;
  isTyping: boolean;
  user?: UserProfile;
}

export interface MessageReadEvent extends MessageReadReceipt {
  conversationId: Guid;
}

export interface RealtimeError {
  message: string;
  code?: string;
  conversationId?: Guid;
  details?: unknown;
}

export type SignalRConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export interface ChatMessage {
  id: Guid;
  conversationId: Guid;
  senderUserId: Guid;
  sender?: UserProfile;
  content: string;
  status?: MessageStatus;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  readReceipts?: MessageReadReceipt[];
  replyToMessageId?: Guid | null;
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface SendMessageRequest {
  conversationId: Guid;
  content: string;
  attachments?: CreateAttachmentRequest[];
  replyToMessageId?: Guid | null;
}

export interface SendTypingRequest {
  conversationId: Guid;
  isTyping: boolean;
}

export interface MarkMessageReadRequest {
  conversationId: Guid;
  messageId: Guid;
}

export interface RemoveReactionRequest {
  messageId: Guid;
  emoji: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export type MessageResponse = ChatMessage;

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
