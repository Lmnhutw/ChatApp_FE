import type { Guid } from "@/types";

const encodeSegment = (value: string): string => encodeURIComponent(value);

export const apiRoutes = {
  auth: {
    login: "/api/Auth/login",
    register: "/api/Auth/register",
    currentUser: "/api/Auth/me",
    confirmEmail: "/api/Auth/confirm-email",
    resendVerificationEmail: (email: string) =>
      `/api/Auth/resend-verification-email/${encodeSegment(email)}`,
    userById: (userId: Guid) => `/api/Auth/GetUserById/${encodeSegment(userId)}`,
  },
  conversations: {
    list: "/api/Conversations",
    byId: (conversationId: Guid) =>
      `/api/Conversations/${encodeSegment(conversationId)}`,
    direct: "/api/Conversations/direct",
    group: "/api/Conversations/group",
    members: (conversationId: Guid) =>
      `/api/Conversations/${encodeSegment(conversationId)}/members`,
    member: (conversationId: Guid, userId: Guid) =>
      `/api/Conversations/${encodeSegment(conversationId)}/members/${encodeSegment(userId)}`,
    leave: (conversationId: Guid) =>
      `/api/Conversations/${encodeSegment(conversationId)}/leave`,
  },
  messages: {
    byConversation: (conversationId: Guid) =>
      `/api/Conversations/${encodeSegment(conversationId)}/messages`,
    byId: (messageId: Guid) => `/api/Messages/${encodeSegment(messageId)}`,
    read: (messageId: Guid) => `/api/Messages/${encodeSegment(messageId)}/read`,
  },
  users: {
    current: "/api/Users/me",
    search: "/api/Users/search",
    byId: (userId: Guid) => `/api/Users/${encodeSegment(userId)}`,
    profile: (userId: Guid) => `/api/Users/${encodeSegment(userId)}/profile`,
    presence: (userId: Guid) => `/api/Users/${encodeSegment(userId)}/presence`,
    blocks: "/api/Users/blocks",
    unblock: (blockedUserId: Guid) =>
      `/api/Users/blocks/${encodeSegment(blockedUserId)}`,
  },
  reactions: {
    byMessage: (messageId: Guid) =>
      `/api/Messages/${encodeSegment(messageId)}/reactions`,
    byId: (reactionId: Guid) => `/api/Reactions/${encodeSegment(reactionId)}`,
  },
  attachments: {
    create: "/api/Attachments",
    byMessage: (messageId: Guid) =>
      `/api/Messages/${encodeSegment(messageId)}/attachments`,
    byId: (attachmentId: Guid) =>
      `/api/Attachments/${encodeSegment(attachmentId)}`,
  },
};
