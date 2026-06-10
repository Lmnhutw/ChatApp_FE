import { apiClient } from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import type { AddReactionRequest, Guid, MessageReaction } from "@/types";

const getReactions = async (messageId: Guid): Promise<MessageReaction[]> => {
  const response = await apiClient.get<MessageReaction[]>(
    apiRoutes.reactions.byMessage(messageId)
  );
  return response.data;
};

const addReaction = async (
  request: AddReactionRequest
): Promise<MessageReaction> => {
  const response = await apiClient.post<MessageReaction>(
    apiRoutes.reactions.byMessage(request.messageId),
    request
  );
  return response.data;
};

const removeReaction = async (reactionId: Guid): Promise<void> => {
  await apiClient.delete(apiRoutes.reactions.byId(reactionId));
};

export const reactionService = {
  getReactions,
  addReaction,
  removeReaction,
};
