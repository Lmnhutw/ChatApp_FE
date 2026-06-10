import { apiClient } from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import type {
  AddConversationMemberRequest,
  ConversationMemberResponse,
  ConversationResponse,
  CreateDirectConversationRequest,
  CreateGroupConversationRequest,
  Guid,
} from "@/types";

const getConversations = async (): Promise<ConversationResponse[]> => {
  const response = await apiClient.get<ConversationResponse[]>(
    apiRoutes.conversations.list
  );
  return response.data;
};

const getConversation = async (
  conversationId: Guid
): Promise<ConversationResponse> => {
  const response = await apiClient.get<ConversationResponse>(
    apiRoutes.conversations.byId(conversationId)
  );
  return response.data;
};

const createDirectConversation = async (
  request: CreateDirectConversationRequest
): Promise<ConversationResponse> => {
  const response = await apiClient.post<ConversationResponse>(
    apiRoutes.conversations.direct,
    request
  );
  return response.data;
};

const createGroupConversation = async (
  request: CreateGroupConversationRequest
): Promise<ConversationResponse> => {
  const response = await apiClient.post<ConversationResponse>(
    apiRoutes.conversations.group,
    request
  );
  return response.data;
};

const getMembers = async (
  conversationId: Guid
): Promise<ConversationMemberResponse[]> => {
  const response = await apiClient.get<ConversationMemberResponse[]>(
    apiRoutes.conversations.members(conversationId)
  );
  return response.data;
};

const addMember = async (
  conversationId: Guid,
  request: AddConversationMemberRequest
): Promise<ConversationMemberResponse> => {
  const response = await apiClient.post<ConversationMemberResponse>(
    apiRoutes.conversations.members(conversationId),
    request
  );
  return response.data;
};

const removeMember = async (
  conversationId: Guid,
  userId: Guid
): Promise<void> => {
  await apiClient.delete(apiRoutes.conversations.member(conversationId, userId));
};

const leaveConversation = async (conversationId: Guid): Promise<void> => {
  await apiClient.post(apiRoutes.conversations.leave(conversationId), {});
};

export const conversationService = {
  getConversations,
  getConversation,
  createDirectConversation,
  createGroupConversation,
  getMembers,
  addMember,
  removeMember,
  leaveConversation,
};
