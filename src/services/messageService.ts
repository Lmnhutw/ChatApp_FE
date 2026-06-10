import { apiClient } from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import type {
  Guid,
  MessageReadReceipt,
  MessageResponse,
  SendMessageRequest,
  UpdateMessageRequest,
} from "@/types";

const getMessages = async (conversationId: Guid): Promise<MessageResponse[]> => {
  const response = await apiClient.get<MessageResponse[]>(
    apiRoutes.messages.byConversation(conversationId)
  );
  return response.data;
};

const sendMessage = async (
  request: SendMessageRequest
): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(
    apiRoutes.messages.byConversation(request.conversationId),
    request
  );
  return response.data;
};

const updateMessage = async (
  messageId: Guid,
  request: UpdateMessageRequest
): Promise<MessageResponse> => {
  const response = await apiClient.put<MessageResponse>(
    apiRoutes.messages.byId(messageId),
    request
  );
  return response.data;
};

const deleteMessage = async (messageId: Guid): Promise<void> => {
  await apiClient.delete(apiRoutes.messages.byId(messageId));
};

const markMessageRead = async (
  messageId: Guid
): Promise<MessageReadReceipt> => {
  const response = await apiClient.post<MessageReadReceipt>(
    apiRoutes.messages.read(messageId),
    {}
  );
  return response.data;
};

export const messageService = {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  markMessageRead,
};
